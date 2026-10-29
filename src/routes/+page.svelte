<script lang="ts">
	import Terminal from '$lib/components/Terminal.svelte';
	import { characters as initialCharacters } from '$lib/mocks/characters';
	import { map } from '$lib/mocks/map';
	import { render } from '$lib/engine/render';
	import { applyMove, isMoveFinished, startMove, type MoveAnimation } from '$lib/engine/animation';
	import type { LogEntry } from '$lib/engine/log';
	import { moveCharacter } from '$lib/engine/movement';
	import { findPath } from '$lib/engine/pathfinding';
	import { npcTurn } from '$lib/engine/npc';
	import { activeId, endTurn, startTurns } from '$lib/engine/turns';

	// Delay before an NPC acts, so its turn is visible
	const NPC_DELAY_MS = 600;

	let canvas: HTMLCanvasElement;

	let characters = $state.raw(initialCharacters);
	let turns = $state.raw(startTurns(initialCharacters));
	let active = $derived(characters.find((c) => c.id === activeId(turns)));
	let animation = $state.raw<MoveAnimation | null>(null);
	let log = $state.raw<LogEntry[]>([]);

	function addLog(character: string, action: string) {
		log = [...log, { character, action }];
	}

	// Characters hold their final position; while an animation runs, each frame draws the in-between one
	$effect(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const current = animation;
		const chars = characters;
		const id = active?.id;
		if (!current) {
			render(ctx, map, chars, id);
			return;
		}
		let frame = requestAnimationFrame(function tick(now) {
			render(ctx, map, applyMove(chars, current, now), id);
			if (isMoveFinished(current, now)) animation = null;
			else frame = requestAnimationFrame(tick);
		});
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		const current = turns;
		const id = activeId(current);
		const npc = characters.find((c) => c.id === id);
		if (npc?.type !== 'PNG') return;
		const timer = setTimeout(() => {
			turns = npcTurn(current);
			addLog(npc.name, 'ends turn');
		}, NPC_DELAY_MS);
		return () => clearTimeout(timer);
	});

	function handleMapClick(event: MouseEvent) {
		if (active?.type !== 'PG' || animation) return;
		const target = { x: event.offsetX, y: event.offsetY };
		const path = findPath(map, characters, active, target);
		if (path) {
			animation = startMove(active, path, performance.now());
			characters = moveCharacter(characters, active.id, target);
			addLog(active.name, `moves to (${target.x}, ${target.y})`);
		} else {
			addLog(active.name, 'cannot go there');
		}
	}

	function handleEndTurn() {
		if (active) addLog(active.name, 'ends turn');
		turns = endTurn(turns);
	}
</script>

<div class="min-h-screen bg-neutral-100">
	<header
		class="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b border-neutral-300 bg-white px-4 py-3"
	>
		<span class="text-sm text-neutral-500">Round {turns.round}</span>
		<ol class="flex flex-wrap gap-2">
			{#each turns.order as id, i}
				{@const character = characters.find((c) => c.id === id)}
				{#if character}
					<li
						class="rounded px-2 py-1 text-sm {i === turns.current
							? 'bg-amber-400 font-semibold text-neutral-900'
							: 'bg-neutral-100 text-neutral-600'}"
					>
						{character.name}
						<span class="text-xs {character.type === 'PG' ? 'text-blue-600' : 'text-red-600'}"
							>{character.type}</span
						>
					</li>
				{/if}
			{/each}
		</ol>
		<button
			class="ml-auto rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40"
			disabled={active?.type !== 'PG' || animation !== null}
			onclick={handleEndTurn}
		>
			End turn
		</button>
	</header>

	<!-- Bottom padding keeps the lower edge of the map scrollable past the terminal -->
	<div class="overflow-auto p-4 pb-60">
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
		<canvas
			bind:this={canvas}
			width={map.width}
			height={map.height}
			class="mx-auto block border border-neutral-300 bg-white"
			onclick={handleMapClick}
		></canvas>
	</div>

	<Terminal entries={log} />
</div>
