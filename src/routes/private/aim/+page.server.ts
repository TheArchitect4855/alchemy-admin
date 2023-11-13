import { dev } from "$app/environment";
import type { PageServerLoad } from "./$types";
import devData from './dev.data.json';

export const load: PageServerLoad = async ({ locals }) => {
	if (dev) return devData;

	const grid = await locals.db.getAllowedRoutesGrid();
	return { grid };
};
