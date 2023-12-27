import type { ActiveUsers, AdminContact, AllowedRoute, AllowedRoutesGrid, AnonymizedFunnels, ApiStats, ClientVersion, Contact, PhoneGreenlist, Profile, ResponseTime } from "./types";

export default interface Database {
	close(): Promise<void>;

	activeUsersGet(): Promise<ActiveUsers[]>;
	adminContactGetByPhone(phone: string): Promise<AdminContact | null>;
	clientVersionCreate(semver: string, isUpdateRequired: boolean): Promise<ClientVersion>;
	clientVersionSetIsUpdateRequired(version: ClientVersion): Promise<void>;
	clientVersionsGet(): Promise<ClientVersion[]>;
	contactGet(id: string): Promise<Contact | null>;
	contactGetByPhone(phone: string): Promise<Contact | null>;
	contactUpdate(id: string, opts: { phone: string, dob: Date, isRedlisted: boolean }): Promise<void>;
	phoneGreenlistCreate(phone: string, nickname: string): Promise<void>;
	phoneGreenlistDelete(phone: string): Promise<void>;
	phoneGreenlistUpdate(phone: string, nickname: string): Promise<void>;
	phoneGreenlistGet(): Promise<PhoneGreenlist[]>;
	profileDelete(contact: string): Promise<void>;
	profileGet(contact: string): Promise<Profile | null>;
	profileSetVisible(contact: string, opts: { isVisible: boolean }): Promise<void>;
	funnelsGetAnonymized(): Promise<AnonymizedFunnels>;

	deleteProfileReviewQueue(id: string): Promise<void>;
	getAllowedRoutesByContact(contact: string): Promise<AllowedRoute[]>;
	getAllowedRoutesGrid(): Promise<AllowedRoutesGrid>;
	getApiStats(): Promise<ApiStats[]>;
	getProfileReviewQueue(): Promise<Profile[]>;
	getResponseTimes(): Promise<ResponseTime[]>;
	updateAllowedRoutesGrid(contacts: AdminContact[], grid: boolean[][]): Promise<AllowedRoutesGrid>;
}
