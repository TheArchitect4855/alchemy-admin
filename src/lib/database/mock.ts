import type Database from "./interface";
import type { ActiveUsers, AdminContact, AnonymizedFunnels, AllowedRoute, AllowedRoutesGrid } from "./types";
import data from "./mock.json";

export default class MockDatabase implements Database {
	async close(): Promise<void> { }

	async activeUsersGet(): Promise<ActiveUsers[]> {
		const activeUsers: ActiveUsers[] = [];
		const start = Date.now() - 2_592_000_000; // 30 days
		const runningDau365 = new Array(365).fill(0).map((_) => randomRangeI(-5, 5) + 50);
		const runningDau30 = runningDau365.slice(runningDau365.length - 30);
		const runningDau7 = runningDau365.slice(runningDau365.length - 7);
		let dau = runningDau7[runningDau7.length - 1];
		for (let i = 0; i < 30; i += 1) {
			const date = new Date(start + 86_400_000 * i);
			dau += Math.round(Math.random() * 2 - 1);
			const wau = Math.round(dau + (Math.random() * 2 - 1));
			const mau = Math.round(dau + (Math.random() * 2 - 1));
			const yau = Math.round(dau + (Math.random() * 2 - 1));
			const avgDau7 = runningDau7.reduce((p, e) => p + e) / runningDau7.length;
			const avgDau30 = runningDau30.reduce((p, e) => p + e) / runningDau30.length;
			const avgDau365 = runningDau365.reduce((p, e) => p + e) / runningDau365.length;
			activeUsers.push({ date, dau, wau, mau, yau, avgDau7, avgDau30, avgDau365 });
			
			runningDau7.shift();
			runningDau7.push(dau);

			runningDau30.shift();
			runningDau30.push(dau);

			runningDau365.shift();
			runningDau365.push(dau);
		}

		return activeUsers;
	}

	async adminContactGetByPhone(phone: string): Promise<AdminContact | null> {
		return data['developer'];
	}

	async funnelsGetAnonymized(): Promise<AnonymizedFunnels> {
		const seen = randomRangeI(500, 1000);
		const loginsStarted = Math.round(seen * randomRange(0.15, 0.17));
		const loginsSucceeded = Math.round(loginsStarted * randomRange(0.9, 0.92));
		const waitlisted = Math.round(loginsSucceeded * randomRange(0.04, 0.06));
		const profileCreationStarted = Math.round(loginsSucceeded * randomRange(0.51, 0.53));
		const basicProfileCreated = Math.round(profileCreationStarted * randomRange(0.71, 0.73));
		const photoUploads = Math.round(basicProfileCreated * randomRange(0.99, 1));
		const tosAgreed = Math.round(photoUploads * randomRange(0.99, 1));
		const profileCreationCompleted = Math.round(tosAgreed * randomRange(0.99, 1));
		const usersMatched = Math.round(profileCreationCompleted * randomRange(0.11, 0.13));
		const usersMessaged = Math.round(usersMatched * randomRange(0.99, 1));
		const profilesDeleted = Math.round(profileCreationCompleted * randomRange(0.24, 0.26));
		return {
			seen,
			loginsStarted,
			loginsSucceeded,
			waitlisted,
			profileCreationStarted,
			basicProfileCreated,
			photoUploads,
			tosAgreed,
			profileCreationCompleted,
			usersMatched,
			usersMessaged,
			profilesDeleted,
		};
	}

	async getAllowedRoutesByContact(contact: string): Promise<AllowedRoute[]> {
		return data['allowedRoutes'];
	}

	async getAllowedRoutesGrid(): Promise<AllowedRoutesGrid> {
		const contacts = [ data['developer'] ];
		const routes = data['allowedRoutes'].map((e, i) => ({
			id: `#${i}`,
			path: e.path,
			name: e.name,
		}));

		const grid = new Array(contacts.length).fill(new Array(routes.length).fill(true));
		return { contacts, routes, grid };
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

function randomRange(min: number, max: number): number {
	const mul = max - min;
	return Math.random() * mul + min;
}

function randomRangeI(min: number, max: number): number {
	return Math.round(randomRange(min, max));
}
