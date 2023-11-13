<svelte:head>
	<title>Alchemy Admin</title>

	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true">
	<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;700;900&display=swap" rel="stylesheet">
</svelte:head>

<slot></slot>

<style>
	@media (prefers-color-scheme: light) {
		:global(:root) {
			--colour-error: #f44336;
			--colour-primary: #7cff66;
			--colour-secondary: #00d2fc;
			--colour-surface: #ffffff;
			--colour-text: #202020;

			--colour-surface-05: #f2f2f2;
			--colour-surface-10: #e6e6e6;
			--colour-surface-20: #cccccc;
			--colour-surface-50: #808080;
			--colour-surface-60: #666666;
			--colour-surface-80: #333333;
		}
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--colour-error: #f44336;
			--colour-primary: #7cff66;
			--colour-secondary: #00d2fc;
			--colour-surface: #101010;
			--colour-text: #ffffff;

			--colour-surface-05: #1d1d1d;
			--colour-surface-10: #2a2a2a;
			--colour-surface-20: #434343;
			--colour-surface-50: #909090;
			--colour-surface-60: #a9a9a9;
			--colour-surface-80: #dcdcdc;
		}
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
		color: var(--colour-text);
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		margin: 0;
		padding: 0.5em 1em;
	}

	:global(button:disabled) {
		cursor: not-allowed;
	}

	:global(button.icon) {
		background-color: transparent;
		border-radius: 0;
		padding: 0;
	}

	:global(button.icon > *) {
		vertical-align: middle;
	}

	:global(dialog) {
		background-color: var(--colour-surface);
		border: 1px solid var(--colour-surface-20);
		border-radius: 4px;
		box-shadow: 2px 2px 4px #0005;
		color: var(--colour-text);
		max-width: 80ch;
	}

	:global(dialog::backdrop) {
		backdrop-filter: blur(4px);
	}

	:global(dialog > header) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1em;
	}

	:global(dialog > header > *) {
		margin: 0;
	}

	:global(hr) {
		border: none;
		border-bottom: 1px solid var(--colour-surface-10);
		margin: 0.5rem 0;
	}

	:global(input) {
		accent-color: var(--colour-primary);
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

	:global(table) {
		border-collapse: collapse;
	}

	:global(table td, table th) {
		border: 1px solid var(--colour-surface-10);
		padding: 0.25em 0.5em;
	}
</style>
