import { error, type RequestHandler } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ locals, request }): Promise<Response> => {
	const url = new URL(request.url);
	const phone = url.searchParams.get('phone');
	if (phone == null) throw error(422, 'Missing phone');

	await locals.db.phoneGreenlistDelete(phone);
	return new Response();
};

export const POST: RequestHandler = async ({ locals, request }): Promise<Response> => {
	const body = await request.json();
	await locals.db.phoneGreenlistCreate(body.phone, body.nickname);
	return new Response();
};

export const PUT: RequestHandler = async ({ locals, request }): Promise<Response> => {
	const body = await request.json();
	await locals.db.phoneGreenlistUpdate(body.phone, body.nickname);
	return new Response();
};
