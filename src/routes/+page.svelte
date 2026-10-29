<script lang="ts">
	import ActionPanel, { type ActionMode } from '$lib/components/ActionPanel.svelte';
	import CharacterSheet from '$lib/components/CharacterSheet.svelte';
	import LifeGauge from '$lib/components/LifeGauge.svelte';
	import InventoryPanel from '$lib/components/Inventory.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import Terminal from '$lib/components/Terminal.svelte';
	import TimeGauge from '$lib/components/TimeGauge.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import { characters as initialCharacters } from '$lib/mocks/characters';
	import { map } from '$lib/mocks/map';
	import { render } from '$lib/engine/render';
	import { applyMove, isMoveFinished, startMove, type MoveAnimation } from '$lib/engine/animation';
	import type { LogEntry } from '$lib/engine/log';
	import type { Inventory } from '$lib/engine/types';
	import { moveCharacter } from '$lib/engine/movement';
	import { findPath } from '$lib/engine/pathfinding';
	import { npcTurn } from '$lib/rules/npc';
	import { activeId, endTurn, moveBlock, spendAction, startTurns } from '$lib/rules/turns';

	// Delay before an NPC acts, so its turn is visible
	const NPC_DELAY_MS = 600;

	let canvas: HTMLCanvasElement;

	let characters = $state.raw(initialCharacters);
	let turns = $state.raw(startTurns(initialCharacters));
	let active = $derived(characters.find((c) => c.id === activeId(turns)));
	let animation = $state.raw<MoveAnimation | null>(null);
	let log = $state.raw<LogEntry[]>([]);

	let mode = $state<ActionMode>('move');
	let sheetOpen = $state(false);
	let inventoryOpen = $state(false);
	let consoleHeight = $state(0);

	// Space between the panels and the edges of the page or the console
	const PANEL_GAP = 16;

	// The PG shown in the panels: the active one, or during NPC turns the last PG who acted
	let viewed = $derived.by(() => {
		const { order, current } = turns;
		for (let i = 0; i < order.length; i++) {
			const id = order[(current - i + order.length) % order.length];
			const character = characters.find((c) => c.id === id);
			if (character?.type === 'PG') return character;
		}
		return undefined;
	});

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
		if (active?.type !== 'PG' || animation || mode !== 'move') return;
		const block = moveBlock(turns.actions);
		if (!block) {
			addLog(active.name, 'has no time left to move');
			return;
		}
		const target = { x: event.offsetX, y: event.offsetY };
		const path = findPath(map, characters, active, target);
		if (path) {
			animation = startMove(active, path, performance.now());
			characters = moveCharacter(characters, active.id, target);
			turns = spendAction(turns, block);
			addLog(active.name, `moves to (${target.x}, ${target.y})`);
		} else {
			addLog(active.name, 'cannot go there');
		}
	}

	function updateInventory(id: string, inventory: Inventory) {
		characters = characters.map((c) => (c.id === id ? { ...c, inventory } : c));
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

	<div
		bind:clientHeight={consoleHeight}
		class="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-3"
	>
		<Toolbar bind:sheetOpen bind:inventoryOpen />
		<Terminal entries={log} />
		{#if viewed}
			<LifeGauge hp={viewed.hp} />
			<!-- Outside its own turn the viewed PG has no time -->
			<TimeGauge actions={viewed.id === active?.id ? turns.actions : null} />
		{/if}
		<ActionPanel bind:mode />
	</div>

	{#if viewed}
		{#if sheetOpen}
			<Panel
				title="Character sheet"
				side="left"
				top={PANEL_GAP}
				bottom={consoleHeight + 2 * PANEL_GAP}
				onclose={() => (sheetOpen = false)}
			>
				<CharacterSheet character={viewed} />
			</Panel>
		{/if}
		{#if inventoryOpen}
			<Panel
				title="Inventory"
				side="right"
				top={PANEL_GAP}
				bottom={consoleHeight + 2 * PANEL_GAP}
				onclose={() => (inventoryOpen = false)}
			>
				<InventoryPanel
					inventory={viewed.inventory}
					onchange={(inventory) => updateInventory(viewed.id, inventory)}
				/>
			</Panel>
		{/if}
	{/if}
</div>
