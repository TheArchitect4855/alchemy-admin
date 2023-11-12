import type { LayoutServerLoad } from "./$types";
import { dev } from "$app/environment";
import type { Session } from "$lib/session";
import { error, redirect } from "@sveltejs/kit";
import { getCookies } from "$lib/cookies";

const developerRoutes = [
	{ path: '/aim', name: 'Admin Identity Management' },
	{ path: '/analytics', name: 'Analytics' },
];

export const load: LayoutServerLoad = async ({ platform, request, url }): Promise<any> => {
	// Authenticate
	let session: Session;
	if (dev) {
		session = {
			allowedRoutes: developerRoutes,
			name: 'Developer',
		};
	} else {
		const env = platform?.env;
		if (!env) throw error(500, 'Missing ENV');

		const cookies = getCookies(request);
		const sid = cookies['sid'];
		if (!sid) throw redirect(303, '/login');

		const kv = await env.KV_CACHE.get(`admin-${sid}`);
		if (kv == null) throw redirect(303, '/login');

		session = JSON.parse(kv);
	}

	if (session.allowedRoutes.length == 0) throw error(500, 'Internal Server Error (User Has No Permissions)');
	if (!session.allowedRoutes.find((e) => url.pathname.startsWith(e.path))) throw redirect(303, session.allowedRoutes[0].path);

	return {
		session,
	}
};
