import type { ClientVersion } from "$lib/database/types";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }): Promise<Response> => {
	const body = await request.json() as { semver: string, isUpdateRequired: boolean };
	const version = await locals.db.clientVersionCreate(body.semver, body.isUpdateRequired);
	return Response.json(version);
};

export const PUT: RequestHandler = async ({ locals, request }): Promise<Response> => {
	const body = await request.json() as ClientVersion[];
	await Promise.all(body.map(locals.db.clientVersionSetIsUpdateRequired));

	const versions = await locals.db.clientVersionsGet();
	return Response.json(versions);
}
