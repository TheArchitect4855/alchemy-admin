<svelte:head>
	<title>Alchemy Admin</title>

	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true">
	<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;700;900&display=swap" rel="stylesheet">
</svelte:head>

<slot></slot>

<style>
	:global(:root) {
		--colour-error: #f44336;
		--colour-primary: #7cff66;
		--colour-secondary: #00d2fc;
		--colour-surface: #ffffff;
		--colour-text: #202020;

		--colour-surface-05: #f2f2f2;
		--colour-surface-10: #e6e6e6;
		--colour-surface-50: #808080;
		--colour-surface-60: #666666;
		--colour-surface-80: #333333;
	}

	:global(.error) {
		color: var(--colour-error);
	}

	:global(.icon-mini) {
		width: 20px;
		height: 20px;
	}

	:global(a) {
		color: var(--colour-secondary);
	}

	:global(body) {
		background-color: var(--colour-surface);
		color: var(--colour-text);
		font-family: 'Lexend', sans-serif;
		font-size: 12pt;
		margin: 0;
		min-height: 100vh;
		padding: 0;
	}

	:global(button) {
		background-color: var(--colour-primary);
		border: none;
		border-radius: 1em;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		margin: 0;
		padding: 0.5em 1em;
	}

	:global(input) {
		background-color: inherit;
		border: 1px solid var(--colour-surface-60);
		border-radius: 1em;
		color: var(--colour-surface-60);
		font-family: inherit;
		outline: none;
		padding: 0.5em;
	}

	:global(label) {
		color: var(--colour-surface-60);
		font-size: 0.9em;
	}
</style>
