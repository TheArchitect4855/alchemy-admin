import type Database from "./interface";
import type { ActiveUsers, AdminContact, AnonymizedFunnels, AllowedRoute, AllowedRoutesGrid, ApiStats, ResponseTime, ClientVersion, Contact, Profile } from "./types";
import data from "./mock.json";

const lastMonth = Date.now() - 2_592_000_000;
const dayMs = 86_400_000;

export default class MockDatabase implements Database {
	private static clientVersions: ClientVersion[] = [ { semver: '0.0.0', isUpdateRequired: true, createdAt: new Date() } ];
	private static profiles: Profile[] = getRandomProfiles(10);

	async close(): Promise<void> { }

	async activeUsersGet(): Promise<ActiveUsers[]> {
		const activeUsers: ActiveUsers[] = [];
		const runningDau365 = new Array(365).fill(0).map((_) => randomRangeI(45, 55));
		const runningDau30 = runningDau365.slice(runningDau365.length - 30);
		const runningDau7 = runningDau365.slice(runningDau365.length - 7);
		let dau = runningDau7[runningDau7.length - 1];
		for (let i = 0; i < 30; i += 1) {
			const date = new Date(lastMonth + dayMs * i);
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

	async clientVersionCreate(semver: string, isUpdateRequired: boolean): Promise<ClientVersion> {
		const ver = { semver, isUpdateRequired, createdAt: new Date() };
		MockDatabase.clientVersions.unshift(ver);
		return ver;
	}

	async clientVersionSetIsUpdateRequired(version: ClientVersion): Promise<void> {
		const ver = MockDatabase.clientVersions.find((e) => e.semver == version.semver);
		if (ver != null) ver.isUpdateRequired = version.isUpdateRequired;
	}

	async clientVersionsGet(): Promise<ClientVersion[]> {
		return MockDatabase.clientVersions;
	}

	async contactGet(id: string): Promise<Contact | null> {
		return MockDatabase.profiles.find((e) => e.contact.id == id)?.contact ?? null;
	}

	async contactGetByPhone(phone: string): Promise<Contact | null> {
		return MockDatabase.profiles.find((e) => e.contact.phone == phone)?.contact ?? null;
	}

	async contactUpdate(id: string, opts: { phone: string; dob: Date; isRedlisted: boolean; }): Promise<void> {
		const contact = MockDatabase.profiles.find((e) => e.contact.id == id)?.contact;
		if (contact == null) return;

		contact.phone = opts.phone;
		contact.dob = opts.dob;
		contact.isRedlisted = opts.isRedlisted;
	}

	async profileDelete(contact: string): Promise<void> {
		const profile = MockDatabase.profiles.findIndex((e) => e.contact.id == contact);
		if (profile >= 0) MockDatabase.profiles.splice(profile, 1);
	}

	async profileGet(contact: string): Promise<Profile | null> {
		return MockDatabase.profiles.find((e) => e.contact.id == contact) ?? null;
	}

	async profileSetVisible(contact: string, opts: { isVisible: boolean; }): Promise<void> {
		const profile = MockDatabase.profiles.find((e) => e.contact.id == contact);
		if (profile != null) profile.isVisible = opts.isVisible;
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

	async getApiStats(): Promise<ApiStats[]> {
		const stats: ApiStats[] = [];
		let requestCount = randomRangeI(450, 550);
		for (let i = 0; i < 30; i += 1) {
			const date = new Date(lastMonth + dayMs * i);
			stats.push({
				date,
				requestCount,
				clientErrorCount: Math.round(requestCount * randomRange(0.1, 0.2)),
				serverErrorCount: Math.round(requestCount * randomRange(0, 0.1)),
			});

			requestCount += randomRangeI(-50, 50);
		}

		return stats;
	}

	async getResponseTimes(): Promise<ResponseTime[]> {
		const responseTimes: ResponseTime[] = [];
		for (let i = 0; i < 30; i += 1) {
			const date = new Date(lastMonth + dayMs * i);
			const p10 = randomRange(0, 250);
			const p50 = p10 + randomRange(0, 500 - p10);
			const p99 = p50 + randomRange(0, 1000 - p50);
			responseTimes.push({ date, p10, p50, p99 });
		}

		return responseTimes;
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

function getRandomProfiles(count: number): Profile[] {
	const res: Profile[] = [];
	for (let i = 0; i < count; i += 1) {
		const idChunks = [];
		for (let j = 0; j < 8; j += 1) {
			const n = randomRangeI(0, 65535);
			const h = n.toString(16).padStart(4, '0');
			idChunks.push(h);
		}

		const id = `${idChunks[0]}${idChunks[1]}-${idChunks[2]}-${idChunks[3]}-${idChunks[4]}-${idChunks[5]}${idChunks[6]}${idChunks[7]}`;

		let phone = '+1';
		for (let j = 0; j < 10; j += 1) phone += randomRangeI(1, 9).toString();

		const dobYear = randomRangeI(1998, 2003);
		const dobMonth = randomRangeI(0, 11);
		const dobDay = randomRange(0, 28);
		const dob = new Date(dobYear, dobMonth, dobDay);
		const contact = { id, phone, dob, isRedlisted: Math.random() < 0.5, tosAgreed: Math.random() < 0.5, createdAt: new Date() };

		let gender: string;
		let pronouns: string;
		const rng = Math.random();
		if (rng < 0.3) {
			gender = 'woman';
			pronouns = 'She/Her';
		} else if (rng < 0.6) {
			gender = 'man';
			pronouns = 'He/Him';
		} else {
			gender = 'nonbinary';
			pronouns = 'They/Them';
		}

		const relationshipInterests: ('flings' | 'friends' | 'romance')[] = [];
		const possibleRelationshipInterests: typeof relationshipInterests = ['flings', 'friends', 'romance'];
		for (const r of possibleRelationshipInterests) {
			if (Math.random() < 0.5) continue;
			relationshipInterests.push(r);
		}

		const profile = {
			contact,
			name: `User ${i}`,
			bio: 'I am a test user.',
			gender,
			photoUrls: [
				'https://images.pexels.com/photos/19488566/pexels-photo-19488566/free-photo-of-yasaka-pagoda-in-kyoto-city-skyline.jpeg',
				'https://images.pexels.com/photos/11785305/pexels-photo-11785305.jpeg',
			],
			neurodiversities: [],
			interests: [],
			relationshipInterests,
			pronouns,
			isVisible: Math.random() < 0.5,
			createdAt: new Date(),
		};

		res.push(profile);
	}

	console.dir(res);
	return res;
}

function randomRange(min: number, max: number): number {
	const mul = max - min;
	return Math.random() * mul + min;
}

function randomRangeI(min: number, max: number): number {
	return Math.round(randomRange(min, max));
}
