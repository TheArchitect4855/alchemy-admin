import type { RequestHandler } from "@sveltejs/kit";

export const PUT: RequestHandler = async ({ locals, request, params }): Promise<Response> => {
	const body = await request.json();
	await locals.db.profileSetVisible(body.id, { isVisible: body.isVisible });
	return new Response();
};
