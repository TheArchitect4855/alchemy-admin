import { dev } from "$app/environment";
import Database from "$lib/Database";
import { error, type ServerLoad } from "@sveltejs/kit";
import devAnalytics from './devAnalytics.json';

export const load: ServerLoad = async ({ platform }): Promise<any> => {
	if (dev) return devAnalytics;

	const env = platform?.env;
	if (env == null) throw error(500, 'Missing ENV');

	const db = await Database.connect(env.DB_CONFIG);
	const activeUsers = await db.activeUsersGet();
	const funnels = await db.funnelsGetAnonymized();
	db.close();

	return { activeUsers, funnels };
};
