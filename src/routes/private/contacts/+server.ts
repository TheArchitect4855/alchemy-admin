import type { RequestHandler } from "@sveltejs/kit";

export const PUT: RequestHandler = async ({ locals, request }): Promise<Response> => {
	const body = await request.json();
	await locals.db.contactUpdate(body.id, { phone: body.phone, dob: new Date(body.dob), isRedlisted: body.isRedlisted });
	return Response.json(body);
}
