<script lang="ts">
	export let dialog: HTMLDialogElement;
	export let title: string;
</script>

<header>
	<h3>{ title }</h3>
	<button class="icon" on:click={() => dialog.close()}>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-mini">
			<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
		</svg>
	</button>
</header>