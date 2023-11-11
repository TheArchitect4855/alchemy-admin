// See https://kit.svelte.dev/docs/types#app

import type { Env } from "$lib/env";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface Platform {
			env?: Env,
		}
	}
}

export {};
