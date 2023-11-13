import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const grid = await locals.db.getAllowedRoutesGrid();
	return { grid };
};
