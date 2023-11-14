import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const apiStats = await locals.db.getApiStats();
	const responseTimes = await locals.db.getResponseTimes();
	return {
		apiStats,
		responseTimes,
	};
};
