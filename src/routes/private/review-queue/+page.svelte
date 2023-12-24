<script lang="ts">
	import type { Profile } from "$lib/database/types";
	import ProfileCard from "../ProfileCard.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
	let profiles: Profile[];
	$: profiles = data.profiles;

	function nextProfile(): void {
		profiles.pop();
	}
</script>

<h2>Review Queue</h2>
{#if profiles.length == 0}
<p>No profiles to review.</p>
{:else}
<ProfileCard profile={profiles[profiles.length - 1]} />
<button on:click={nextProfile}>Next</button>
{/if}
