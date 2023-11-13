import { dev } from "$app/environment";
import Database from "$lib/Database";
import { error, type RequestHandler } from "@sveltejs/kit";

export const PUT: RequestHandler = async ({ platform, request }): Promise<Response> => {
	const body = await request.json();
	if (dev) {
		for (const c of body.contacts) {
			delete c.isDirty;
		}

		return Response.json(body);
	}

	const env = platform?.env;
	if (env == null) throw error(500, 'Missing ENV');

	const db = await Database.connect(env.DB_CONFIG);
	const grid = await db.updateAllowedRoutesGrid(body.contacts, body.grid);
	db.close();

	return Response.json(grid);
}
