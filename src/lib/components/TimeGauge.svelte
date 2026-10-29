<script lang="ts">
	import type { ActionBlock, Actions } from '$lib/rules/turns';

	// Null when it is not the character's turn: every block shows as spent
	let { actions }: { actions: Actions | null } = $props();

	// Biggest on top, sized by what each block allows
	const BLOCKS: { key: ActionBlock; label: string; size: number }[] = [
		{ key: 'standard', label: 'Standard action or move', size: 3 },
		{ key: 'move', label: 'Move', size: 2 },
		{ key: 'quick', label: 'Quick action', size: 1 }
	];
</script>

<div class="paper flex w-16 flex-col items-center gap-2 py-3" aria-label="Time left this turn">
	{#each BLOCKS as { key, label, size }}
		{@const available = actions?.[key] ?? false}
		<div
			class="segment"
			class:spent={!available}
			style:flex-grow={size}
			title="{label}{available ? '' : ' (spent)'}"
			role="img"
			aria-label="{label}: {available ? 'available' : 'spent'}"
		></div>
	{/each}
</div>

<style>
	.segment {
		flex-basis: 0;
		width: 36px;
		background: #1f2a5c;
		border: 2px solid #1f2a5c;
		border-radius: 10px 4px 9px 5px / 5px 9px 4px 10px;
		transition: background 0.3s ease;
	}

	.segment.spent {
		background: transparent;
		border-style: dashed;
		border-color: rgba(43, 43, 58, 0.35);
	}
</style>
