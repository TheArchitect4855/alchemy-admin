import { dev } from "$app/environment";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import Database from "$lib/Database";
import devData from './dev.data.json';

export const load: PageServerLoad = async ({ platform }) => {
	if (dev) return devData;

	const env = platform?.env;
	if (!env) throw error(500, 'Missing ENV');

	const db = await Database.connect(env.DB_CONFIG);
	const grid = await db.getAllowedRoutesGrid();
	db.close();

	return { grid };
};
