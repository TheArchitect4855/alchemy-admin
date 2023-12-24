<script lang="ts">
	import type { Profile } from "$lib/database/types";
	import ContactCard from "./ContactCard.svelte";

	export let profile: Profile;

	async function toggleVisibility(): Promise<void> {
		const body = { id: profile.contact.id, isVisible: !profile.isVisible };
		await fetch(`/private/contacts/profiles`, {
			body: JSON.stringify(body),
			method: 'PUT',
		});

		profile = { ...profile, isVisible: body.isVisible };
	}
</script>

<article>
	<ContactCard contact={ profile.contact } />
	<div class="image-container">
		{#each profile.photoUrls as url, i}
		<img src={ url } alt={ `Profile Photo ${i}` } />
		{/each}
	</div>
	<h1>{ profile.name }</h1>
	<p>
	{#if profile.pronouns}
		{ profile.pronouns } | { profile.gender }
	{:else}
		{ profile.gender }
	{/if}
	</p>
	<section class="chip-container">
		{#each profile.interests as i}
		<div class="chip">{ i }</div>
		{/each}
		{#each profile.neurodiversities as n}
		<div class="chip">{ n }</div>
		{/each}
	</section>
	<section class="chip-container">
		{#each profile.relationshipInterests as i}
		<div class="chip">{ i }</div>
		{/each}
	</section>
	<p>
		Created { profile.createdAt.toLocaleTimeString() } |
		{#if profile.isVisible}
		VISIBLE
		{:else}
		<span class="error">NOT VISIBLE</span>
		{/if}
	</p>
	<button on:click={toggleVisibility}>Toggle Visibility</button>
</article>

<style>
	.chip {
		border: 1px solid var(--colour-surface-50);
		border-radius: 1ch;
		display: inline;
		padding: 0.25ch 0.5ch;
	}

	.chip-container {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		font-size: 0.9rem;
		gap: 1ch;
	}

	.image-container {
		overflow-x: auto;
	}

	.image-container > img {
		border-radius: 1ch;
		margin-block: 1em;
		margin-right: 1ch;
		max-height: 50vh;
		max-width: 100%;
	}

	article {
		border: 1px solid var(--colour-surface-80);
		border-radius: 1ch;
		margin-block: 1em;
		padding: 1ch;
	}
</style>
