<script lang="ts">
	import { onMount } from "svelte";

	export let name: string;
	let button: HTMLElement;
	let dropdown: HTMLElement;

	let didMount = false;
	let isMenuOpen = false;
	$: {
		if (didMount && isMenuOpen) {
			button.style.transitionDelay = '0s';
			button.style.setProperty('--border-radius', '0em');

			dropdown.style.transitionDelay = '0.2s';
			dropdown.style.borderWidth = '1px';
			dropdown.style.height = `${dropdown.scrollHeight}px`;
		} else if (didMount) {
			button.style.transitionDelay = '0.2s';
			button.style.setProperty('--border-radius', '1em');

			dropdown.style.transitionDelay = '0s';
			dropdown.style.borderWidth = '0px';
			dropdown.style.height = '0px';
		}
	}

	onMount(() => {
		document.addEventListener('click', () => isMenuOpen = false);
		dropdown.addEventListener('click', (e) => e.stopPropagation());
		didMount = true;
	});

	function onClick(e: Event): void {
		e.stopPropagation();
		isMenuOpen = !isMenuOpen;
	}
</script>

<button bind:this={ button } on:click={ onClick }>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-mini">
		<path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
	</svg>
	{ name }

	<div bind:this={ dropdown } class="dropdown">
		<a href="/logout" style="display: block; margin: 0.5rem auto;">Log Out</a>
	</div>
</button>

<style>
	.dropdown {
		background-color: inherit;
		border: 0px solid var(--colour-surface-10);
		border-bottom-left-radius: 1em;
		border-bottom-right-radius: 1em;
		border-top: none;
		height: 0;
		overflow: hidden;
		transition: border-width 0.2s, height 0.2s;

		position: absolute;
		top: 100%;
		left: -1px;
		right: -1px;
	}

	button {
		--border-radius: 1em;
		background-color: var(--colour-surface-05);
		border: 1px solid var(--colour-surface-10);
		border-bottom-left-radius: var(--border-radius);
		border-bottom-right-radius: var(--border-radius);
		display: block;
		position: relative;
		transition: border-radius 0.2s;
	}

	button > * {
		vertical-align: middle;
	}
</style>
