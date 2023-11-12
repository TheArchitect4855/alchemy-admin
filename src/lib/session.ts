import type { AllowedRoute } from "./Database";

export type Session = {
	allowedRoutes: AllowedRoute[],
	name: string,
};
