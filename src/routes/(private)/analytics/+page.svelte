<script lang="ts">
	import 'chart.js/auto';
	import { Chart, Line } from 'svelte-chartjs';
	import type { LayoutData } from "../$types";
	import type { ActiveUsers } from "$lib/Database";

	export let data: LayoutData;

	const activeUsers = {
		labels: data.activeUsers.map((e: ActiveUsers) => new Date(e.date).toLocaleDateString()),
		datasets: [
			{
				label: 'Daily Active Users',
				borderColor: '#7cff66',
				data: data.activeUsers.map((e: ActiveUsers) => e.dau),
			},
			{
				label: 'Weekly Active Users',
				borderColor: '#00d2fc',
				data: data.activeUsers.map((e: ActiveUsers) => e.wau),
			},
			{
				label: 'Monthly Active Users',
				borderColor: '#f44336',
				data: data.activeUsers.map((e: ActiveUsers) => e.mau),
			},
			{
				label: 'Avg. Dau (Week)',
				borderColor: '#9046cf',
				data: data.activeUsers.map((e: ActiveUsers) => e.avgDau7),
			},
			{
				label: 'Avg. Dau (Month)',
				borderColor: '#F5cb5c',
				data: data.activeUsers.map((e: ActiveUsers) => e.avgDau30),
			},
		],
	};
</script>

<h2>Analytics</h2>
<section>
	<h4>Active Users</h4>
	<div class="container">
		<Line data={ activeUsers } options={{ maintainAspectRatio: false }} />
	</div>
</section>
<hr />

<style>
	section > .container {
		height: 50vh;
	}
</style>
