import { dev } from "$app/environment";
import { error, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	const body = await request.formData();
	const email = body.get('email');
	if (email == null) throw error(422, 'Missing \'email\'');

	if (dev) {
		return Response.json({ message: 'An email has been sent with your login code.' });
	} else {
		throw error(501, 'Not Implemented');
	}
};
