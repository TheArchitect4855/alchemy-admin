<script lang="ts">
	import ProfileCard from "../../../ProfileCard.svelte";
import type { PageData } from "./$types";

	export let data: PageData;
</script>

<ProfileCard profile={ data.profile } />
