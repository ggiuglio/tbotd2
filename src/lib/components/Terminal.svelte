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

<div class="paper fixed bottom-4 left-1/2 z-20 w-[min(640px,calc(100vw-32px))] -translate-x-1/2">
	<div bind:this={output} class="ruled h-48 overflow-y-auto px-5">
		{#each entries as entry}
			<div>{formatLogEntry(entry)}</div>
		{:else}
			<div class="opacity-50">No actions yet</div>
		{/each}
	</div>
</div>

<style>
	/* Hand-drawn ink border on cream paper */
	.paper {
		background: #fdf8e8;
		border: 2px solid #2b2b3a;
		border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
		box-shadow: 3px 4px 0 rgba(43, 43, 58, 0.15);
		overflow: hidden;
	}

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
