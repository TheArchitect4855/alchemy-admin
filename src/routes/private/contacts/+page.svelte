<script lang="ts">
	import ContactCard from "../ContactCard.svelte";
import type { PageData } from "./$types";

	export let data: PageData;
</script>

<h2>Contacts</h2>
<form action="/private/contacts" method="get" on:submit={(e) => e.stopPropagation()}>
	<h4>Contact Lookup</h4>
	<label for="contact-lookup-input">ID or phone:</label>
	<input name="query" id="contact-lookup-input" type="text" placeholder="+12345678910" required />
	<button type="submit">Search</button>
	<span class="error">{ data.message }</span>
</form>

{#if data.contact != null}
<ContactCard contact={ data.contact } />
{/if}

<style>
	form {
		border: 1px solid var(--colour-surface-80);
		margin-block: 1em;
		padding: 1ch;

		display: flex;
		flex-direction: row;
		gap: 1em;
		align-items: center;
	}

	form > * {
		margin: 0;
	}
</style>
