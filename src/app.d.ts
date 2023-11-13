// See https://kit.svelte.dev/docs/types#app

import type { Env } from "$lib/env";
import type Database from "$lib/Database";
import type { Session } from "$lib/session";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: Database,
			session: Session,
		}

		// interface PageData {}
		interface Platform {
			env?: Env,
		}
	}
}

export {};
