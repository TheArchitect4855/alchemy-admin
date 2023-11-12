<script lang="ts">
	import type { LayoutData } from "./$types";
	import IdTag from "./IdTag.svelte";

	export let data: LayoutData;
</script>

<header>
	<img id="logo" alt="Alchemy" src="/logo-64.png" />
	<h1>Alchemy Admin</h1>
	<IdTag name={ data.session.name } />
</header>
<nav>
{#each data.session.allowedRoutes as route}
	<a href={ route.path }>{ route.name }</a>
{/each}
</nav>
<main>
	<slot></slot>
</main>

<style>
	:global(body) {
		height: 100vh;

		display: grid;
		grid-template-columns: 20ch 1fr;
		grid-template-rows: calc(64px + 1rem) 1fr;
	}

	header {
		border-bottom: 1px solid var(--colour-surface-10);
		grid-column: 1 / 3;
		grid-row: 1 / 2;
		padding: 0.5rem 1rem;

		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	nav {
		border-right: 1px solid var(--colour-surface-10);
		grid-column: 1 / 2;
		grid-row: 2 / 3;
		padding: 0.5rem;
	}

	nav > a {
		display: block;
		margin: 0.5em;
	}

	main {
		grid-column: 2 / 3;
		grid-row: 2 / 3;
		overflow: auto;
		padding: 0.5rem;
	}
</style>
