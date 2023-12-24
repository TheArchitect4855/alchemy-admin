import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const profile = await locals.db.profileGet(params.id);
	if (profile == null) throw error(404, 'Invalid contact ID');
	return { profile };
};
