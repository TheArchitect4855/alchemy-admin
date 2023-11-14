<script lang="ts">
	import Chart from "../../Chart.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;

	const requests = {
		labels: data.apiStats.map((e) => e.date.toLocaleDateString()),
		datasets: [
			{
				label: 'API Requests',
				borderColor: '#7cff66',
				data: data.apiStats.map((e) => e.requestCount),
			},
			{
				label: '4XX Errors',
				borderColor: '#f5cb5c',
				data: data.apiStats.map((e) => e.clientErrorCount),
			},
			{
				label: '5XX Errors',
				borderColor: '#f44336',
				data: data.apiStats.map((e) => e.serverErrorCount),
			},
		],
	};

	const responseTimes = {
		labels: data.responseTimes.map((e) => e.date.toLocaleDateString()),
		datasets: [
			{
				label: 'p10',
				borderColor: '#7cff66',
				data: data.responseTimes.map((e) => e.p10),
			},
			{
				label: 'p50',
				borderColor: '#f5cb5c',
				data: data.responseTimes.map((e) => e.p50),
			},
			{
				label: 'p99',
				borderColor: '#f44336',
				data: data.responseTimes.map((e) => e.p99),
			}
		],
	};
</script>

<h2>API Logs</h2>
<section>
	<h4>Requests</h4>
	<div class="container">
		<Chart type="line" data={ requests } options={{ maintainAspectRatio: false }} />
	</div>
</section>
<section>
	<h4>Response Times (milliseconds)</h4>
	<div class="container">
		<Chart type="line" data={ responseTimes } options={{ maintainAspectRatio: false }} />
	</div>
</section>

<style>
	section > .container {
		height: 50vh;
	}
</style>
