import type { AllowedRoute, AdminContact } from "./database/types";

export type Session = {
	allowedRoutes: AllowedRoute[],
	contact: AdminContact,
};
