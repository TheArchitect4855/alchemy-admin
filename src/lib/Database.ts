import * as neon from '@neondatabase/serverless';

export type AdminContact = {
	id: string,
	name: string,
	phone: string,
}

export default class Database {
	private client: neon.Client;

	constructor(client: neon.Client) {
		this.client = client;
	}

	close(): Promise<void> {
		return this.client.end();
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

	static async connect(config: string): Promise<Database> {
		const client = new neon.Client(config);
		await client.connect();
		return new Database(client);
	}
}

function toAdminContact(row: any): AdminContact {
	return {
		id: row.id,
		name: row.name,
		phone: row.phone,
	};
}
