<script lang="ts">
	import Chart from 'chart.js/auto';
	import type { ChartData, ChartOptions, ChartTypeRegistry, Plugin } from 'chart.js/auto';
	import type { AnyObject } from 'chart.js/dist/types/basic';
	import { onMount } from "svelte";

	export let data: ChartData;
	export let type: keyof ChartTypeRegistry;
	export let options: ChartOptions | undefined = undefined;
	export let plugins: Plugin<keyof ChartTypeRegistry, AnyObject>[] | undefined = undefined;

	let canvas: HTMLCanvasElement;
	let chart: Chart;
	onMount(() => {
		chart = new Chart(canvas, { data, type, options, plugins });
		return chart.destroy;
	});
</script>

<canvas bind:this={ canvas }></canvas>
