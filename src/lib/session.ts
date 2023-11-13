import type { AdminContact, AllowedRoute } from "./Database";

export type Session = {
	allowedRoutes: AllowedRoute[],
	contact: AdminContact,
};
