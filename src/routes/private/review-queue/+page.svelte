<script lang="ts">
	import type { Profile } from "$lib/database/types";
	import Spinner from "../../Spinner.svelte";
	import ProfileCard from "../ProfileCard.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
	let currentProfile: Profile;
	let profiles: Profile[];
	$: {
		profiles = data.profiles;
		currentProfile = profiles[0];
	}

	let isBusy = false;

	async function nextProfile(): Promise<void> {
		if (isBusy) return;

		isBusy = true;
		await fetch(`/private/review-queue?id=${encodeURIComponent(currentProfile.contact.id)}`, {
			method: 'DELETE',
		});

		profiles.shift();
		currentProfile = profiles[0];
		isBusy = false;
	}
</script>

<h2>Review Queue</h2>
{#if profiles.length == 0}
<p>No profiles to review.</p>
{:else}
<ProfileCard profile={currentProfile} />
<button on:click={nextProfile} style={ isBusy ? 'background-color: var(--colour-surface-10);' : null }>
	{#if isBusy}
	<Spinner />
	{:else}
	Next
	{/if}
</button>
{/if}
