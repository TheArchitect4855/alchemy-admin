import { dev } from "$app/environment";
import LoginHandler, { SendLoginCodeResult, VerifyLoginCodeResult } from "$lib/LoginHandler";
import { base64EncodeBuffer } from "$lib/encoding";
import type { Session } from "$lib/session";
import { error, type RequestHandler } from "@sveltejs/kit";

const sessionTtl = 604_800;

export const POST: RequestHandler = async ({ locals, platform, request }): Promise<Response> => {
	const body = await request.formData();
	const phone = body.get('phone')?.toString();
	const code = body.get('code')?.toString();
	if (phone == null || code == null) throw error(422, 'Missing Parameters');

	if (dev) return new Response();

	const env = platform?.env;
	if (!env) throw error(500, 'Missing ENV');

	const contact = await locals.db.adminContactGetByPhone(phone);
	if (contact == null) throw error(403, 'You Shall Not Pass');

	const allowedRoutes = await locals.db.getAllowedRoutesByContact(contact.id);

	const loginHandler = LoginHandler.getHandler(env);
	const res = await loginHandler.verifyLoginCode(phone, code);
	switch (res) {
		case VerifyLoginCodeResult.OK:
			const sessionId = genSessionId();
			const session: Session = {
				allowedRoutes,
				contact,
			};

			await env.KV_CACHE.put(`admin-${sessionId}`, JSON.stringify(session), {
				expirationTtl: sessionTtl,
			});

			const headers = new Headers();
			headers.set('Set-Cookie', `sid=${encodeURIComponent(sessionId)}; HttpOnly; Max-Age=${sessionTtl}; Path=/; SameSite=Lax; Secure;`);
			return new Response(null, {
				headers,
			});
		case VerifyLoginCodeResult.InvalidCode:
		case VerifyLoginCodeResult.InvalidCodeFormat:
		case VerifyLoginCodeResult.NotApproved:
			throw error(422, 'Invalid Login Code');
		case VerifyLoginCodeResult.InvalidPhoneFormat:
			throw error(422, 'Invalid Phone Number');
		case VerifyLoginCodeResult.ServiceUnavailable:
			throw error(503, 'Authentication Service Unavailable');
	}
};

export const PUT: RequestHandler = async ({ locals, platform, request }): Promise<Response> => {
	const body = await request.formData();
	const phone = body.get('phone')?.toString();
	if (phone == null) throw error(422, 'Missing Parameters');

	if (dev) return new Response();

	const env = platform?.env;
	if (!env) throw error(500, 'Missing ENV');

	const contact = await locals.db.adminContactGetByPhone(phone);
	if (contact == null) throw error(403, 'You Shall Not Pass');

	const loginHandler = LoginHandler.getHandler(env);
	const res = await loginHandler.sendLoginCode(phone, 'sms');
	switch (res) {
		case SendLoginCodeResult.OK:
			return new Response();
		case SendLoginCodeResult.InvalidFormat:
		case SendLoginCodeResult.InvalidPhone:
			throw error(422, 'Invalid Phone Number');
		case SendLoginCodeResult.ServiceUnavailable:
			throw error(503, 'Authentication Service Unavailable');
	}
};

function genSessionId(): string {
	const buffer = new Uint8Array(128);
	crypto.getRandomValues(buffer);
	return base64EncodeBuffer(buffer);
}
