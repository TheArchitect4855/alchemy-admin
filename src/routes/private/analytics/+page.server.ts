import { dev } from "$app/environment";
import type { ServerLoad } from "@sveltejs/kit";
import devAnalytics from './dev.data.json';

export const load: ServerLoad = async ({ locals }): Promise<any> => {
	if (dev) return devAnalytics;

	const activeUsers = await locals.db.activeUsersGet();
	const funnels = await locals.db.funnelsGetAnonymized();
	return { activeUsers, funnels };
};
