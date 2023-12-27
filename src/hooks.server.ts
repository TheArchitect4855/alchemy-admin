import { dev } from "$app/environment";
import type Database from "$lib/database/interface";
import MockDatabase from "$lib/database/mock";
import NeonDatabase from "$lib/database/neon";
import type { Session } from "$lib/session";
import { error, redirect, type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }): Promise<Response> => {
	// Authentication
	if (event.url.pathname == '/login' && dev) {
		event.locals.db = new MockDatabase();
		return resolve(event);
	} else if (event.url.pathname == '/login') {
		const env = event.platform?.env;
		if (!env) throw error(500, 'Missing ENV');
		event.locals.db = await NeonDatabase.connect(env.DB_CONFIG);
		return resolve(event);
	}

	const isPrivate = event.url.pathname.startsWith('/private');
	if (!isPrivate && event.url.pathname != '/') return resolve(event);

	const acceptHeader = event.request.headers.get('Accept');
	const authError = acceptHeader?.includes('text/html') ? redirect(303, '/login') : error(401, 'Unauthorized');

	let cache: KVNamespace | null;
	let db: Database;
	let session: Session;
	if (dev) {
		cache = null;
		db = new MockDatabase();
		session = {
			allowedRoutes: await db.getAllowedRoutesByContact(''),
			contact: (await db.adminContactGetByPhone(''))!,
		};
	} else {
		const env = event.platform?.env;
		if (!env) throw error(500, 'Missing ENV');
		cache = env.KV_CACHE;

		const sid = event.cookies.get('sid');
		if (!sid) throw authError;

		const kv = await env.KV_CACHE.get(`admin-${sid}`);
		if (!kv) throw authError;

		session = JSON.parse(kv);
		db = await NeonDatabase.connect(env.DB_CONFIG);
	}

	if (session.allowedRoutes.length == 0) {
		if (event.url.pathname == '/private/noroutes') return resolve(event);
		else throw redirect(303, '/private/noroutes');
	}

	if (!session.allowedRoutes.find((e) => event.url.pathname.startsWith(`/private${e.path}`))) throw redirect(303, `/private${session.allowedRoutes[0].path}`);

	event.locals.cache = cache;
	event.locals.db = db;
	event.locals.session = session;

	try {
		const response = await resolve(event);
		return response;
	} catch (e: unknown) {
		console.error(e);
		throw e;
	} finally {
		db.close();
	}
};
