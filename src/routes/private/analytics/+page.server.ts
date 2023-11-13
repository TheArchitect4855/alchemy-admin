import type { ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals }): Promise<any> => {
	const activeUsers = await locals.db.activeUsersGet();
	const funnels = await locals.db.funnelsGetAnonymized();
	return { activeUsers, funnels };
};
