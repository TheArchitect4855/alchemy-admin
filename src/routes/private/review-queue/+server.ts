import { error, type RequestHandler } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ locals, request }): Promise<Response> => {
	const url = new URL(request.url);
	const id = url.searchParams.get('id');
	if (id == null) throw error(422, 'Missing ID');

	await locals.db.deleteProfileReviewQueue(id);
	return new Response();
}
