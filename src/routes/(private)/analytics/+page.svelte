<script lang="ts">
	import type { LayoutData } from "../$types";
	import type { ActiveUsers } from "$lib/Database";
	import Chart from "../../Chart.svelte";

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
				borderColor: '#f5cb5c',
				data: data.activeUsers.map((e: ActiveUsers) => e.avgDau30),
			},
		],
	};

	const funnelColours: { [key: string]: string } = {
		'Logins Failed': '#f5cb5c',
		'Profile Deleted': '#f44336',
		'Waitlisted': '#f5cb5c',
	};

	const funnels = {
		datasets: [
			{
				label: 'Funnels',
				colorMode: 'to',
				colorFrom: (e: any) => funnelColours[e.raw.from] ?? '#00d2fc',
				colorTo: (e: any) => funnelColours[e.raw.to] ?? '#00d2fc',
				column: {
					'Logins Failed': 2,
					'Waitlisted': 3,
				},
				size: 'max',
				data: [
					{ from: 'Total Visitors', to: 'Logins Started', flow: data.funnels.loginsStarted },
					{ from: 'Logins Started', to: 'Logins Succeeded', flow: data.funnels.loginsSucceeded },
					{ from: 'Logins Started', to: 'Logins Failed', flow: data.funnels.loginsStarted - data.funnels.loginsSucceeded },
					{ from: 'Logins Succeeded', to: 'Waitlisted', flow: data.funnels.waitlisted },
					{ from: 'Logins Succeeded', to: 'Profile Creation Started', flow: data.funnels.profileCreationStarted },
					{ from: 'Profile Creation Started', to: 'Basic Profile Created', flow: data.funnels.basicProfileCreated },
					{ from: 'Basic Profile Created', to: 'Photo Uploads', flow: data.funnels.photoUploads },
					{ from: 'Photo Uploads', to: 'TOS Agreed', flow: data.funnels.tosAgreed },
					{ from: 'TOS Agreed', to: 'Profile Creation Completed', flow: data.funnels.profileCreationCompleted },
					{ from: 'Profile Creation Completed', to: 'Users Matched', flow: data.funnels.usersMatched },
					{ from: 'Users Matched', to: 'Users Messaged', flow: data.funnels.usersMessaged },
					{ from: 'Profile Creation Completed', to: 'Profile Deleted', flow: data.funnels.profilesDeleted },
				],
			}
		],
	};
</script>

<h2>Analytics</h2>
<section>
	<h4>Active Users</h4>
	<div class="container">
		<Chart type="line" data={ activeUsers } options={{ maintainAspectRatio: false }} />
	</div>
</section>
<hr />
<section>
	<h4>Funnels</h4>
	<div class="container">
		<Chart type="sankey" data={ funnels } options={{ maintainAspectRatio: false }} />
	</div>
</section>

<style>
	section > .container {
		height: 50vh;
	}
</style>
