import { dev } from "$app/environment";
import Database from "$lib/Database";
import type { Session } from "$lib/session";
import { error, redirect, type Handle } from "@sveltejs/kit";

const developerRoutes = [
	{ path: '/aim', name: 'Admin Identity Management' },
	{ path: '/analytics', name: 'Analytics' },
];

export const handle: Handle = async ({ event, resolve }): Promise<Response> => {
	// Authentication
	const isPrivate = event.url.pathname.startsWith('/private');
	if (!isPrivate && event.url.pathname != '/') return resolve(event);

	const acceptHeader = event.request.headers.get('Accept');
	const authError = acceptHeader?.includes('text/html') ? redirect(303, '/login') : error(401, 'Unauthorized');

	let db: Database | null;
	let session: Session;
	if (dev) {
		db = null;
		session = {
			allowedRoutes: developerRoutes,
			contact: {
				id: '00000000-0000-0000-0000-000000000000',
				name: 'Developer',
				phone: '+15555555555',
			},
		};
	} else {
		const env = event.platform?.env;
		if (!env) throw error(500, 'Missing ENV');

		const sid = event.cookies.get('sid');
		if (!sid) throw authError;

		const kv = await env.KV_CACHE.get(`admin-${sid}`);
		if (!kv) throw authError;

		session = JSON.parse(kv);
		db = await Database.connect(env.DB_CONFIG);
	}

	if (session.allowedRoutes.length == 0) {
		if (event.url.pathname == '/private/noroutes') return resolve(event);
		else throw redirect(303, '/private/noroutes');
	}

	if (!session.allowedRoutes.find((e) => event.url.pathname.startsWith(`/private${e.path}`))) throw redirect(303, `/private${session.allowedRoutes[0].path}`);

	event.locals.db = db!;
	event.locals.session = session;

	const response = await resolve(event);
	if (db) db.close();
	return response;
};
