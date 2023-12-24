import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const profiles = await locals.db.getProfileReviewQueue();
	return { profiles };
};
