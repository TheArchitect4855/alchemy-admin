export const load = async ({ locals }) => {
	const greenlist = await locals.db.phoneGreenlistGet();
	return { greenlist };
}
