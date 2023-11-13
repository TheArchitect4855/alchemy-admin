import { dev } from "$app/environment";
import type { RequestHandler } from "@sveltejs/kit";

export const PUT: RequestHandler = async ({ locals, request }): Promise<Response> => {
	const body = await request.json();
	if (dev) {
		for (const c of body.contacts) {
			delete c.isDirty;
		}

		return Response.json(body);
	}

	const grid = await locals.db.updateAllowedRoutesGrid(body.contacts, body.grid);
	return Response.json(grid);
}
