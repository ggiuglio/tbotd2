<script lang="ts">
	import { MOOD_COLOR } from '$lib/engine/render';
	import type { Character } from '$lib/engine/types';
	import type { TurnState } from '$lib/rules/turns';

	let {
		turns,
		characters,
		top
	}: {
		turns: TurnState;
		characters: Character[];
		// Distance in pixels from the top of the viewport
		top: number;
	} = $props();

	// The acting character first, then the ones still to act this round, then next round's first ones
	let upcoming = $derived(
		turns.order
			.map((_, i) => {
				const index = (turns.current + i) % turns.order.length;
				return {
					character: characters.find((c) => c.id === turns.order[index]),
					nextRound: i > 0 && index <= turns.current
				};
			})
			.filter((u): u is { character: Character; nextRound: boolean } => u.character !== undefined)
	);
</script>

<ol class="fixed left-4 z-20 flex w-48 flex-col gap-1" style:top="{top}px" aria-label="Turn order">
	{#each upcoming as { character, nextRound }, i (character.id)}
		{#if nextRound && !upcoming[i - 1]?.nextRound}
			<li class="px-2 pt-1 text-xs text-neutral-500">Round {turns.round + 1}</li>
		{/if}
		<li
			class="flex items-baseline justify-between gap-2 rounded px-2 py-1 text-sm shadow-sm {i === 0
				? 'bg-amber-400 font-semibold text-neutral-900'
				: 'bg-white/90 text-neutral-700'}"
		>
			<span class="truncate">{character.name}</span>
			<span
				class="text-xs {character.type === 'PG' ? 'text-blue-600' : 'text-red-600'}"
				style:color={character.mood && MOOD_COLOR[character.mood]}
				>{character.mood ?? character.type}</span
			>
		</li>
	{/each}
</ol>
