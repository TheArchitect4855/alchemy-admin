import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, request }) => {
	const url = new URL(request.url);
	const query = url.searchParams.get('query');
	if (query == null) return { contact: null, message: '' };

	if (/^\+\d+$/.test(query)) {
		const contact = await locals.db.contactGetByPhone(query);
		return { contact, message: contact == null ? 'Contact does not exist.' : '' };
	} else if (/^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(query)) {
		const contact = await locals.db.contactGet(query);
		return { contact, message: contact == null ? 'Contact does not exist.' : '' };
	} else return { contact: null, message: 'Invalid search query (must be a contact ID or phone number).' }
};
