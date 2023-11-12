import * as neon from '@neondatabase/serverless';

export type ActiveUsers = {
	date: Date,
	dau: number,
	wau: number,
	mau: number,
	yau: number,
	avgDau7: number,
	avgDau30: number,
	avgDau365: number,
};

export type AdminContact = {
	id: string,
	name: string,
	phone: string,
}

export type AnonymizedFunnels = {
	seen: number,
	loginsStarted: number,
	loginsSucceeded: number,
	waitlisted: number,
	profileCreationStarted: number,
	basicProfileCreated: number,
	photoUploads: number,
	tosAgreed: number,
	profileCreationCompleted: number,
	usersMatched: number,
	usersMessaged: number,
	profilesDeleted: number,
};

export default class Database {
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

	static async connect(config: string): Promise<Database> {
		const client = new neon.Client(config);
		await client.connect();
		return new Database(client);
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
