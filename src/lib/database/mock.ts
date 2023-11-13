import type Database from "./interface";
import type { ActiveUsers, AdminContact, AnonymizedFunnels, AllowedRoute, AllowedRoutesGrid } from "./types";
import data from "./mock.json";

export default class MockDatabase implements Database {
	async close(): Promise<void> { }

	async activeUsersGet(): Promise<ActiveUsers[]> {
		return data['activeUsers'].map((e) => {
			const f = e as any;
			f.date = new Date(e.date);
			return f as ActiveUsers;
		});
	}

	async adminContactGetByPhone(phone: string): Promise<AdminContact | null> {
		return data['developer'];
	}

	async funnelsGetAnonymized(): Promise<AnonymizedFunnels> {
		return data['funnels'];
	}

	async getAllowedRoutesByContact(contact: string): Promise<AllowedRoute[]> {
		return data['allowedRoutes'];
	}

	async getAllowedRoutesGrid(): Promise<AllowedRoutesGrid> {
		return data['allowedRoutesGrid'];
	}

	async updateAllowedRoutesGrid(contacts: AdminContact[], grid: boolean[][]): Promise<AllowedRoutesGrid> {
		const res = await this.getAllowedRoutesGrid();
		res.contacts = contacts.map((e) => {
			delete (e as any).isDirty;
			if (e.id == null) e.id = e.phone; // Hack for development IDs
			return e;
		});

		res.grid = grid;
		return res;
	}
}
