import * as neon from '@neondatabase/serverless';
import { error } from '@sveltejs/kit';
import type Database from './interface';
import type { ActiveUsers, AdminContact, AdminRoute, AllowedRoute, AllowedRoutesGrid, AnonymizedFunnels } from './types';

export default class NeonDatabase implements Database {
	private client: neon.Client;

	constructor(client: neon.Client) {
		this.client = client;
	}

	close(): Promise<void> {
		return this.client.end();
	}

	async activeUsersGet(): Promise<ActiveUsers[]> {
		const query = await this.client.query(`
			WITH cd AS (
				SELECT contact_id, created_at::DATE as date
				FROM api_logs
				GROUP BY contact_id, date
			), dau AS (
				SELECT count(contact_id) AS dau, date
				FROM cd
				GROUP BY date
			)
			SELECT DISTINCT date, dau, (
				SELECT count(DISTINCT contact_id)
				FROM cd
				WHERE cd.date <= d.date
				AND cd.date > d.date - INTERVAL '7 days'
			) AS wau, (
				SELECT count(DISTINCT contact_id)
				FROM cd
				WHERE cd.date <= d.date
				AND cd.date > d.date - INTERVAL '1 month'
			) AS mau, (
				SELECT count(DISTINCT contact_id)
				FROM cd
				WHERE cd.date <= d.date
				AND cd.date > d.date - INTERVAL '1 year'
			) AS yau, (
				SELECT avg(d2.dau)
				FROM dau d2
				WHERE d2.date <= d.date
				AND d2.date > d.date - INTERVAL '7 days'
			) AS avg_dau_7_days, (
				SELECT avg(d2.dau)
				FROM dau d2
				WHERE d2.date <= d.date
				AND d2.date > d.date - INTERVAL '30 days'
			) AS avg_dau_30_days, (
				SELECT avg(d2.dau)
				FROM dau d2
				WHERE d2.date <= d.date
				AND d2.date > d.date - INTERVAL '365 days'
			) AS avg_dau_365_days
			FROM dau d
			ORDER BY date DESC
			LIMIT 30
		`);

		return query.rows.map(toActiveUsers).reverse();
	}

	async adminContactGetByPhone(phone: string): Promise<AdminContact | null> {
		const query = await this.client.query(`
			SELECT id, name, phone
			FROM admin_contacts
			WHERE phone = $1
		`, [ phone ]);

		if (query.rows.length == 0) return null;
		return toAdminContact(query.rows[0]);
	}

	async funnelsGetAnonymized(): Promise<AnonymizedFunnels> {
		const query = await this.client.query(`
			SELECT first_login_start IS NOT NULL AS login_started,
				first_login_success IS NOT NULL AS login_succeeded,
				waitlisted_at IS NOT NULL AS waitlisted,
				contact_created IS NOT NULL AS contact_created,
				profile_created IS NOT NULL AS profile_created,
				photos_uploaded IS NOT NULL AS photos_uploaded,
				tos_agreed IS NOT NULL AS tos_agreed,
				first_explore IS NOT NULL AS intake_completed,
				first_match IS NOT NULL AS has_matched,
				first_message IS NOT NULL AS was_messaged,
				profile_deleted IS NOT NULL AS profile_deleted
			FROM funnels
			WHERE first_seen > '2023-09-05' -- Bad data before here
			ORDER BY first_seen DESC
		`);

		const r = query.rows;
		const seen = r.length;
		const loginsStarted = r.filter((e) => e.login_started).length;
		const loginsSucceeded = r.filter((e) => e.login_succeeded).length;
		const waitlisted = r.filter((e) => e.waitlisted).length;
		const profileCreationStarted = r.filter((e) => e.contact_created).length;
		const basicProfileCreated = r.filter((e) => e.profile_created).length;
		const photoUploads = r.filter((e) => e.photos_uploaded).length;
		const tosAgreed = r.filter((e) => e.tos_agreed).length;
		const profileCreationCompleted = r.filter((e) => e.intake_completed).length;
		const usersMatched = r.filter((e) => e.has_matched).length;
		const usersMessaged = r.filter((e) => e.was_messaged).length;
		const profilesDeleted = r.filter((e) => e.profile_deleted).length;
		return { seen, loginsStarted, loginsSucceeded, waitlisted, profileCreationStarted, basicProfileCreated, photoUploads, tosAgreed, profileCreationCompleted, usersMatched, usersMessaged, profilesDeleted };
	}

	async getAllowedRoutesByContact(contact: string): Promise<AllowedRoute[]> {
		const query = await this.client.query(`
			SELECT ar.path, ar.name
			FROM admin_contacts ac
			INNER JOIN admin_contact_routes acr
				ON ac.id = acr.contact
			INNER JOIN admin_routes ar
				ON ar.id = acr.route
			WHERE ac.id = $1
			ORDER BY name
		`, [ contact ]);

		return query.rows.map(toAllowedRoute);
	}

	async getAllowedRoutesGrid(): Promise<AllowedRoutesGrid> {
		const contactsQuery = await this.client.query(`
			SELECT id, name, phone
			FROM admin_contacts
			ORDER BY name
		`);

		const routesQuery = await this.client.query(`
			SELECT id, path, name
			FROM admin_routes
			ORDER BY name
		`);

		const linksQuery = await this.client.query(`
			SELECT contact, route
			FROM admin_contact_routes
		`);

		const contacts = contactsQuery.rows.map(toAdminContact);
		const routes = routesQuery.rows.map(toAdminRoute);
		const routeIds = routes.map((e) => e.id);

		const links: { [contact: string]: boolean[] } = {};
		for (const row of linksQuery.rows) {
			if (links[row.contact] == undefined) {
				links[row.contact] = new Array(routes.length).fill(false);
			}

			const i = routeIds.indexOf(row.route);
			links[row.contact][i] = true;
		}

		const grid: boolean[][] = [];
		for (const c of contacts) grid.push(links[c.id]);
		return { contacts, routes, grid };
	}

	async updateAllowedRoutesGrid(contacts: AdminContact[], grid: boolean[][]): Promise<AllowedRoutesGrid> {
		await this.client.query('BEGIN TRANSACTION');
		try {
			const current = await this.getAllowedRoutesGrid();
			const contactIds = contacts.map((e) => e.id);
			const checkRoutes: string[] = [];
			for (const c of current.contacts) {
				const i = contactIds.indexOf(c.id);
				if (i < 0) {
					await this.client.query('DELETE FROM admin_contact_routes WHERE contact = $1', [ c.id ]);
					await this.client.query('DELETE FROM admin_contacts WHERE id = $1', [ c.id ]);
					continue;
				}

				const contact = contacts[i];
				checkRoutes.push(contact.id);
				if (c.name == contact.name && c.phone == contact.phone) continue;
				await this.client.query('UPDATE admin_contacts SET name = $2, phone = $3 WHERE id = $1', [ contact.id, contact.name, contact.phone ]);
			}

			for (let i = 0; i < contacts.length; i += 1) {
				const c = contacts[i];
				if (current.contacts.findIndex((e) => e.id == c.id) >= 0) continue;

				const q = await this.client.query('INSERT INTO admin_contacts (name, phone) VALUES ($1, $2) RETURNING id', [ c.name, c.phone ]);
				c.id = q.rows[0].id;

				const g = grid[i].map((e, j) => e ? current.routes[j].id : null).filter((e) => e != null);
				for (const r of g) await this.client.query('INSERT INTO admin_contact_routes (contact, route) VALUES ($1, $2)', [ c.id, r ]);
			}

			for (const id of checkRoutes) {
				const i = current.contacts.findIndex((e) => e.id == id);
				const j = contactIds.indexOf(id);

				const iGrid = current.grid[i];
				const jGrid = grid[j];
				for (let r = 0; r < iGrid.length; r += 1) {
					if (iGrid[r] == jGrid[r]) continue;
					if (iGrid[r]) await this.client.query('DELETE FROM admin_contact_routes WHERE contact = $1 AND route = $2', [ id, current.routes[r].id ]);
					else await this.client.query('INSERT INTO admin_contact_routes (contact, route) VALUES ($1, $2)', [ id, current.routes[r].id ]);
				}
			}

			await this.client.query('COMMIT');
		} catch (e: unknown) {
			await this.client.query('ROLLBACK');
			console.error(e);
			throw error(500, 'Internal Server Error');
		}
		
		return this.getAllowedRoutesGrid();
	}

	static async connect(config: string): Promise<NeonDatabase> {
		const client = new neon.Client(config);
		await client.connect();
		return new NeonDatabase(client);
	}
}

function toActiveUsers(row: any): ActiveUsers {
	return {
		date: row.date,
		dau: row.dau,
		wau: row.wau,
		mau: row.mau,
		yau: row.yau,
		avgDau7: row.avg_dau_7_days,
		avgDau30: row.avg_dau_30_days,
		avgDau365: row.avg_dau_365_days,
	};
}

function toAdminContact(row: any): AdminContact {
	return {
		id: row.id,
		name: row.name,
		phone: row.phone,
	};
}

function toAdminRoute(row: any): AdminRoute {
	return {
		id: row.id,
		path: row.path,
		name: row.name,
	};
}

function toAllowedRoute(row: any): AllowedRoute {
	return {
		path: row.path,
		name: row.name,
	};
}
