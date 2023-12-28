<script lang="ts">
	import type { Report } from "$lib/database/types";
	import ContactCard from "../ContactCard.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
	let reports: Report[];
	let currentReport: Report;
	let reportIndex = 0;
	$: {
		reports = data.reports;
		currentReport = reports[reportIndex];
	}

	async function nextReport(): Promise<void> {
		const contact = currentReport.contact.id;
		const reporter = currentReport.reporter.id;
		reportIndex += 1;
		await fetch(`/private/reports?contact=${encodeURIComponent(contact)}&reporter=${encodeURIComponent(reporter)}`, {
			method: 'DELETE',
		});
	}
</script>

<h2>Reports</h2>
{#if currentReport}
<article>
	<div>
		<h3>Reported</h3>
		<ContactCard contact={ currentReport.contact } />
		<h3>Reporter</h3>
		<ContactCard contact={ currentReport.reporter } />
	</div>
	<div>
		<h4>Reason for report:</h4>
		<p>{ currentReport.reason }</p>
		<p><i>Created { currentReport.createdAt.toLocaleString() }</i></p>
		<button on:click={nextReport}>Next Report</button>
	</div>
</article>
<hr />
<i>Report { reportIndex + 1 } / { reports.length }</i>
{:else}
<i>No reports.</i>
{/if}

<style>
	article {
		margin-block: 1.5em;

		display: flex;
		flex-direction: row;
		gap: 1rem;
	}
</style>
