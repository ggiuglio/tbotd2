<script lang="ts">
	import { formatLogEntry, type LogEntry } from '$lib/engine/log';

	let { entries }: { entries: LogEntry[] } = $props();

	let output: HTMLDivElement;

	// Keep the latest entry in view
	$effect(() => {
		entries.length;
		output.scrollTop = output.scrollHeight;
	});
</script>

<!-- Leaves room for the toolbar, the gauges and the action panel around it -->
<div class="paper w-[min(640px,calc(100vw-384px))]">
	<div bind:this={output} class="ruled h-48 overflow-y-auto px-5">
		{#each entries as entry}
			<div>{formatLogEntry(entry)}</div>
		{:else}
			<div class="opacity-50">No actions yet</div>
		{/each}
	</div>
</div>

<style>
	/* Notebook lines, one per text line */
	.ruled {
		font-family: 'Kalam', cursive;
		font-size: 1rem;
		line-height: 28px;
		color: #1f2a5c;
		padding-top: 6px;
		padding-bottom: 6px;
		background-image: repeating-linear-gradient(
			to bottom,
			transparent 0,
			transparent 27px,
			rgba(31, 42, 92, 0.15) 27px,
			rgba(31, 42, 92, 0.15) 28px
		);
		background-position: 0 6px;
		background-attachment: local;
	}
</style>
