<script lang="ts">
	import type { ChartData, ChartOptions, ChartTypeRegistry, Plugin } from 'chart.js';
	import type { AnyObject } from 'chart.js/dist/types/basic';
	import { onMount } from "svelte";

	import {
		CategoryScale,
		Chart,
		Legend,
		LinearScale,
		LineController,
		LineElement,
		PointElement,
		Tooltip,
	} from 'chart.js';
	import { SankeyController, Flow } from 'chartjs-chart-sankey';

	Chart.register(CategoryScale, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip);

	export let data: ChartData;
	export let type: keyof ChartTypeRegistry;
	export let options: ChartOptions | undefined = undefined;
	export let plugins: Plugin<keyof ChartTypeRegistry, AnyObject>[] | undefined = undefined;

	let canvas: HTMLCanvasElement;
	let chart: Chart;
	onMount(() => {
		Chart.register(SankeyController, Flow); // HACK: For some reason, `import ... from 'chartjs-chart-sankey'` happens _after_ Chart.register
		chart = new Chart(canvas, { data, type, options, plugins });
		chart.destroy = chart.destroy.bind(chart);
		return chart.destroy;
	});
</script>

<canvas bind:this={ canvas }></canvas>
