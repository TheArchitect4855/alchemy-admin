import { dev } from "$app/environment";
import type { AllowedRoutesGrid } from "$lib/database/types";
import type { Session } from "$lib/session";
import type { RequestHandler } from "@sveltejs/kit";

type CacheKeyList = {
	keys: {
		name: string,
		expiration?: number,
		metadata?: Record<string, string>,
	}[],
	list_complete: boolean,
	cursor: string,
}

export const PUT: RequestHandler = async ({ locals, request }): Promise<Response> => {
	const body = await request.json();
	if (dev) {
		for (const c of body.contacts) {
			delete c.isDirty;
		}

		return Response.json(body);
	}

	const grid = await locals.db.updateAllowedRoutesGrid(body.contacts, body.grid);
	if (locals.cache) await updateSessions(locals.cache, grid);

	return Response.json(grid);
}

async function updateSessions(cache: KVNamespace, grid: AllowedRoutesGrid): Promise<void> {
	const promises: Promise<void>[] = [];
	let cursor: string | undefined = undefined;
	let isFinished = false;
	while (!isFinished) {
		const list: CacheKeyList = await cache.list({ prefix: 'admin-', cursor });
		for (const key of list.keys) promises.push(updateSession(cache, key.name, key.expiration, grid));
		if (list.list_complete) isFinished = true;
		else cursor = list.cursor;
	}

	await Promise.all(promises);
}

async function updateSession(cache: KVNamespace, key: string, expiration: number | undefined, grid: AllowedRoutesGrid): Promise<void> {
	const kv = await cache.get(key);
	const session = JSON.parse(kv) as Session;

	const i = grid.contacts.findIndex((e) => e.id == session.contact.id);
	const allowedRoutes = grid.routes.filter((_, j) => grid.grid[i][j])
		.map((e) => ({ path: e.path, name: e.name }));

	session.allowedRoutes = allowedRoutes;
	await cache.put(key, JSON.stringify(session), { expiration });
}
