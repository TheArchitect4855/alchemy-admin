import { error, type RequestHandler } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ locals, request }): Promise<Response> => {
	const url = new URL(request.url);
	const contact = url.searchParams.get('contact');
	const reporter = url.searchParams.get('reporter');
	if (contact == null) throw error(422, 'Missing contact');
	if (reporter == null) throw error(422, 'Missing reporter');

	await locals.db.reportsDelete(contact, reporter);
	return new Response();
};
