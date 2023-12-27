import * as neon from '@neondatabase/serverless';
import { error } from '@sveltejs/kit';
import type Database from './interface';
import type { ActiveUsers, AdminContact, AdminRoute, AllowedRoute, AllowedRoutesGrid, AnonymizedFunnels, ApiStats, ClientVersion, Contact, PhoneGreenlist, Profile, ResponseTime } from './types';

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

	async clientVersionCreate(semver: string, isUpdateRequired: boolean): Promise<ClientVersion> {
		const query = await this.client.query(`
			INSERT INTO client_versions (semver, is_update_required)
			VALUES ($1, $2)
			RETURNING semver, is_update_required, created_at
		`, [ semver, isUpdateRequired ]);

		return toClientVersion(query.rows[0]);
	}

	async clientVersionSetIsUpdateRequired(version: ClientVersion): Promise<void> {
		await this.client.query(`
			UPDATE client_versions
			SET is_update_required = $3
			WHERE semver = $1
				AND created_at = $2
		`, [ version.semver, version.createdAt, version.isUpdateRequired ]);
	}

	async clientVersionsGet(): Promise<ClientVersion[]> {
		const query = await this.client.query(`
			SELECT semver, is_update_required, created_at
			FROM client_versions
			ORDER BY created_at DESC
		`);

		return query.rows.map(toClientVersion);
	}

	async contactGet(id: string): Promise<Contact | null> {
		const query = await this.client.query(`
			SELECT id, phone, dob, is_redlisted, tos_agreed, created_at
			FROM contacts
			WHERE id = $1
		`, [ id ]);

		if (query.rows.length == 0) return null;
		else return toContact(query.rows[0]);
	}

	async contactGetByPhone(phone: string): Promise<Contact | null> {
		const query = await this.client.query(`
			SELECT id, phone, dob, is_redlisted, tos_agreed, created_at
			FROM contacts
			WHERE phone = $1
		`, [ phone ]);

		if (query.rows.length == 0) return null;
		else return toContact(query.rows[0]);
	}

	async contactUpdate(id: string, opts: { phone: string; dob: Date; isRedlisted: boolean; }): Promise<void> {
		await this.client.query(`
			UPDATE contact
			SET phone = $2,
				dob = $3,
				is_redlisted = $4
			WHERE id = $1
		`, [ id, opts.phone, opts.dob, opts.isRedlisted ]);
	}

	async phoneGreenlistCreate(phone: string, nickname: string): Promise<void> {
		await this.client.query(`
			INSERT INTO phone_greenlist (phone, nickname)
			VALUES ($1, $2)
		`, [ phone, nickname ]);
	}

	async phoneGreenlistDelete(phone: string): Promise<void> {
		await this.client.query(`
			DELETE FROM phone_greenlist
			WHERE phone = $1
		`, [ phone ]);
	}

	async phoneGreenlistGet(): Promise<PhoneGreenlist[]> {
		const query = await this.client.query(`SELECT phone, nickname FROM phone_greenlist`);
		return query.rows.map((e) => ({ phone: e.phone, nickname: e.nickname }));
	}

	async phoneGreenlistUpdate(phone: string, nickname: string): Promise<void> {
		await this.client.query(`
			UPDATE phone_greenlist
			SET nickname = $2
			WHERE phone = $1
		`, [ phone, nickname ]);
	}

	async profileDelete(contact: string): Promise<void> {
		await this.client.query(`DELETE FROM profiles WHERE contact = $1`, [ contact ]);
	}
	
	async profileGet(contact: string): Promise<Profile | null> {
		const query = await this.client.query(`
			SELECT c.id, c.phone, c.dob, c.is_redlisted, c.tos_agreed, c.created_at AS ct_created_at,
				p.name, p.bio, p.gender, p.photo_urls, p.neurodiversities, p.interests,
				p.relationship_interests, p.pronouns, p.is_visible, p.created_at AS pr_created_at
			FROM profiles p
			INNER JOIN contacts c
				ON p.contact = c.id
			WHERE c.id = $1
		`, [ contact ]);

		if (query.rows.length == 0) return null;
		else return toProfile(query.rows[0]);
	}

	async profileSetVisible(contact: string, opts: { isVisible: boolean; }): Promise<void> {
		await this.client.query(`
			UPDATE profiles
			SET is_visible = $2
			WHERE contact = $1
		`, [ contact, opts.isVisible ]);
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

	async deleteProfileReviewQueue(id: string): Promise<void> {
		await this.client.query(`
			DELETE FROM review_queue
			WHERE item = $1
				AND kind = 'profile'
		`, [ id ]);
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

	async getApiStats(): Promise<ApiStats[]> {
		const query = await this.client.query(`
			SELECT date_trunc('day', created_at) AS ts, count(*) AS num_requests,
				count(status) FILTER (WHERE status >= 400 AND status < 500) AS client_errors,
				count(status) FILTER (WHERE status >= 500 AND status < 600) AS server_errors
			FROM api_logs
			WHERE created_at > now() - INTERVAL '30 DAYS'
				AND client_info LIKE 'Alchemy App%'
			GROUP BY ts
			ORDER BY ts ASC
			LIMIT 30
		`);

		return query.rows.map(toApiStats);
	}

	async getProfileReviewQueue(): Promise<Profile[]> {
		const query = await this.client.query(`
			SELECT c.id, c.phone, c.dob, c.is_redlisted, c.tos_agreed, c.created_at AS ct_created_at,
				p.name, p.bio, p.gender, p.photo_urls, p.neurodiversities, p.interests,
				p.relationship_interests, p.pronouns, p.is_visible, p.created_at AS pr_created_at
			FROM review_queue rq
			INNER JOIN profiles p
				ON rq.item = p.contact
			INNER JOIN contacts c
				ON rq.item = c.id
			WHERE rq.kind = 'profile'
			ORDER BY rq.created ASC
		`);

		return query.rows.map(toProfile);
	}

	async getResponseTimes(): Promise<ResponseTime[]> {
		const query = await this.client.query(`
			SELECT date_trunc('day', created_at) AS ts,
				percentile_cont(0.1) WITHIN GROUP (ORDER BY request_duration) AS p10,
				percentile_cont(0.5) WITHIN GROUP (ORDER BY request_duration) AS p50,
				percentile_cont(0.99) WITHIN GROUP (ORDER BY request_duration) AS p99
			FROM api_logs
			WHERE created_at > now() - INTERVAL '30 DAYS'
			GROUP BY ts
			ORDER BY ts ASC
			LIMIT 30
		`);

		return query.rows.map(toResponseTime);
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

function toApiStats(row: any): ApiStats {
	return {
		date: new Date(row.ts),
		requestCount: row.num_requests,
		clientErrorCount: row.client_errors,
		serverErrorCount: row.server_errors,
	};
}

function toClientVersion(row: any): ClientVersion {
	return { semver: row.semver, isUpdateRequired: row.is_update_required, createdAt: new Date(row.created_at) };
}

function toContact(row: any): Contact {
	return { id: row.id, phone: row.phone, dob: row.dob, isRedlisted: row.is_redlisted, tosAgreed: row.tos_agreed, createdAt: row.created_at };
}

function toProfile(row: any): Profile {
	return {
		contact: {
			id: row.id,
			phone: row.phone,
			dob: row.dob,
			isRedlisted: row.is_redlisted,
			tosAgreed: row.tos_agreed,
			createdAt: row.ct_created_at,
		},
		name: row.name,
		bio: row.bio,
		gender: row.gender,
		photoUrls: row.photo_urls,
		neurodiversities: row.neurodiversities,
		interests: row.interests,
		relationshipInterests: row.relationship_interests,
		pronouns: row.pronouns,
		isVisible: row.is_visible,
		createdAt: row.pr_created_at,
	};
}

function toResponseTime(row: any): ResponseTime {
	return {
		date: new Date(row.ts),
		p10: row.p10.milliseconds,
		p50: row.p50.milliseconds,
		p99: row.p99.milliseconds,
	};
}
