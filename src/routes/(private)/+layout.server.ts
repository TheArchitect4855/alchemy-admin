import type { LayoutServerLoad } from "./$types";
import { dev } from "$app/environment";
import type { Session } from "$lib/session";
import { error, redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = ({ url }) => {
	// Authenticate
	let session: Session;
	if (dev) {
		session = {
			allowedRoutes: [
				{ path: '/analytics', name: 'Analytics' },
			],
			name: 'Developer',
		};
	} else {
		throw error(501, 'Not Implemented');
	}

	if (session.allowedRoutes.length == 0) throw error(500, 'Internal Server Error (User Has No Permissions)');
	if (!session.allowedRoutes.find((e) => url.pathname.startsWith(e.path))) throw redirect(303, session.allowedRoutes[0].path);

	return {
		session,
	}
};
