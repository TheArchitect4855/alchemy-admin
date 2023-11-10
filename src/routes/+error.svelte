<script lang="ts">
	import { page } from "$app/stores";
</script>

<main>
	<h1>An Error Occurred</h1>
	<h3>{$page.error?.message}</h3>
</main>

<style>
	h3 {
		color: var(--colour-surface-60);
	}

	main {
		height: 100vh;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
