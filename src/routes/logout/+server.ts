import { dev } from "$app/environment";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = (): Response => {
	if (dev) {
		throw redirect(303, '/login');
	} else {
		throw error(501, 'Not Implemented');
	}
};
