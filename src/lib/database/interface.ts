import type { ActiveUsers, AdminContact, AllowedRoute, AllowedRoutesGrid, AnonymizedFunnels, ApiStats, ResponseTime } from "./types";

export default interface Database {
	close(): Promise<void>;

	activeUsersGet(): Promise<ActiveUsers[]>;
	adminContactGetByPhone(phone: string): Promise<AdminContact | null>;
	funnelsGetAnonymized(): Promise<AnonymizedFunnels>;

	getAllowedRoutesByContact(contact: string): Promise<AllowedRoute[]>;
	getAllowedRoutesGrid(): Promise<AllowedRoutesGrid>;
	getApiStats(): Promise<ApiStats[]>;
	getResponseTimes(): Promise<ResponseTime[]>;
	updateAllowedRoutesGrid(contacts: AdminContact[], grid: boolean[][]): Promise<AllowedRoutesGrid>;
}
