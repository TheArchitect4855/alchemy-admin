import { dev } from "$app/environment";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = ({ cookies, platform }): Response => {
	if (dev) throw redirect(303, '/login');

	const env = platform?.env;
	if (!env) throw error(500, 'Missing ENV');

	const sid = cookies.get('sid');
	if (!sid) throw redirect(303, '/login');
	env.KV_CACHE.delete(sid);

	const headers = new Headers();
	headers.set('Location', '/login');
	headers.set('Set-Cookie', 'sid=; Max-Age=0;');
	return new Response(null, {
		headers,
		status: 303,
	});
};
