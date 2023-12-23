import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const clientVersions = await locals.db.clientVersionsGet();
	return { clientVersions };
};
