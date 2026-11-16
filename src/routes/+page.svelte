<script lang="ts">
	import ActionPanel, { type ActionMode } from '$lib/components/ActionPanel.svelte';
	import CharacterSheet from '$lib/components/CharacterSheet.svelte';
	import LifeGauge from '$lib/components/LifeGauge.svelte';
	import InventoryPanel from '$lib/components/Inventory.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import Terminal from '$lib/components/Terminal.svelte';
	import TimeGauge from '$lib/components/TimeGauge.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import TurnOrder from '$lib/components/TurnOrder.svelte';
	import { tick, untrack } from 'svelte';
	import { characters as initialCharacters } from '$lib/mocks/characters';
	import { map as initialMap } from '$lib/mocks/map';
	import { render } from '$lib/engine/render';
	import { applyMove, isMoveFinished, startMove, type MoveAnimation } from '$lib/engine/animation';
	import type { Choice, LogEntry, LogOption } from '$lib/engine/log';
	import type { Character, Inventory, Item, Mood, Point } from '$lib/engine/types';
	import { moveCharacter } from '$lib/engine/movement';
	import { findPath, findPathNextTo, isNextTo } from '$lib/engine/pathfinding';
	import { canSee, pick } from '$lib/engine/sight';
	import { characterRadius } from '$lib/engine/characters';
	import { pathLength, PIXELS_PER_METER, truncatePath } from '$lib/engine/geometry';
	import { npcTurn } from '$lib/rules/npc';
	import {
		containerOptions,
		contentsText,
		inReach,
		itemLabel,
		openContainer,
		takeItem
	} from '$lib/rules/containers';
	import { formatCheck } from '$lib/rules/checks';
	import {
		heldAttacks,
		inCombat,
		areFriends,
		inMeleeReach,
		isDead,
		menaceReach,
		rollAttack,
		takeAttack
	} from '$lib/rules/combat';
	import { addItem, isWeapon } from '$lib/rules/inventory';
	import { diplomacy, taunt, talkOptions } from '$lib/rules/talk';
	import {
		activeId,
		endTurn,
		FULL_ACTIONS,
		movementLeft,
		quickBlock,
		removeFromTurns,
		spendAction,
		spendMovement,
		startTurns,
		type ActionBlock
	} from '$lib/rules/turns';

	// Delay before an NPC acts, so its turn is visible
	const NPC_DELAY_MS = 600;

	let canvas: HTMLCanvasElement;
	let mapView: HTMLDivElement;
	let headerHeight = $state(0);

	// Containers change as they are opened and emptied
	let map = $state.raw(initialMap);
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

	// Outside combat time is unlimited: every block is available and none is spent
	let timed = $derived(inCombat(characters));
	let available = $derived(timed ? turns.actions : FULL_ACTIONS);

	// Meters the active character can still move this turn; unlimited outside combat
	let moveLeft = $derived(active && timed ? movementLeft(turns, active.speed) : Infinity);

	// Shown around the active PG in move mode, only in combat where movement is limited
	let moveRange = $derived(
		mode === 'move' && active?.type === 'PG' && timed && moveLeft > 0
			? { center: active.position, radius: moveLeft * PIXELS_PER_METER }
			: undefined
	);

	// Shown with the move range: the areas threatened by every character not friendly to the mover
	let menaceAreas = $derived.by(() => {
		const mover = active;
		if (!moveRange || !mover) return [];
		return characters.flatMap((c) => {
			if (c.id === mover.id || areFriends(c, mover)) return [];
			const reach = menaceReach(c);
			if (reach === null) return [];
			return [{ center: c.position, radius: characterRadius(c) + reach * PIXELS_PER_METER }];
		});
	});

	function spend(block: ActionBlock) {
		if (timed) turns = spendAction(turns, block);
	}

	function addLog(character: string, action: string, options?: LogOption[]) {
		log = [...log, { character, action, options }];
	}

	// Characters hold their final position; while an animation runs, each frame draws the in-between one
	$effect(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const currentMap = map;
		const current = animation;
		const chars = characters;
		const id = active?.id;
		const range = moveRange;
		const menace = menaceAreas;
		if (!current) {
			render(ctx, currentMap, chars, id, range, menace);
			return;
		}
		let frame = requestAnimationFrame(function tick(now) {
			render(ctx, currentMap, applyMove(chars, current, now), id);
			if (isMoveFinished(current, now)) animation = null;
			else frame = requestAnimationFrame(tick);
		});
		return () => cancelAnimationFrame(frame);
	});

	// Changes only when a new turn starts, not when the order shrinks around the same character
	let turnKey = $derived(`${turns.round}:${activeId(turns)}`);

	// At the start of each turn, scroll the map so the acting character sits in the middle
	// of the visible area, between the header and the console
	$effect(() => {
		void turnKey;
		const position = untrack(() => active?.position);
		if (!position) return;
		tick().then(() => {
			const rect = canvas.getBoundingClientRect();
			const scale = rect.width / canvas.width;
			const x = rect.left + position.x * scale;
			const y = rect.top + position.y * scale;
			const visibleTop = headerHeight;
			const visibleBottom = window.innerHeight - consoleHeight - PANEL_GAP;
			mapView.scrollBy({ left: x - window.innerWidth / 2, behavior: 'smooth' });
			window.scrollBy({ top: y - (visibleTop + visibleBottom) / 2, behavior: 'smooth' });
		});
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
		if (mode === 'look') look(target);
		else if (mode === 'talk') talk(target);
		else if (mode === 'attack') attack(target);
		else if (mode === 'move') move(target);
	}

	// Looking takes no time
	function look(target: Point) {
		if (!active) return;
		const sighting = pick(map, characters, active, target);
		if (!sighting) addLog(active.name, 'sees nothing of note');
		else if (!canSee(map, active, sighting)) addLog(active.name, 'cannot see there');
		else {
			const obj = sighting.object;
			const contents = obj?.opened ? `, open, holding ${contentsText(obj)}` : '';
			addLog(active.name, `sees ${sighting.description}${contents}`, obj && containerOptions(obj));
		}
	}

	// Starting to talk takes no time, the reply chosen is a quick action; only NPCs in sight can be talked to
	function talk(target: Point) {
		if (!active) return;
		const npc = pick(map, characters, active, target)?.character;
		if (npc?.type !== 'PNG' || !npc.mood) addLog(active.name, 'finds no one to talk to there');
		else if (!canSeeCharacter(active, npc)) addLog(active.name, `cannot see ${npc.name}`);
		else addLog(active.name, `talks to ${npc.name}, who is ${npc.mood}`, talkOptions(npc));
	}

	// A standard action: one attack with each weapon held that can reach the target.
	// Melee needs the target adjacent and in sight, ranged only in sight
	function attack(target: Point) {
		if (!active) return;
		const attacker = active;
		const victim = pick(map, characters, attacker, target)?.character;
		if (!victim) {
			addLog(attacker.name, 'finds no one to attack there');
			return;
		}
		const held = heldAttacks(attacker);
		if (held.length === 0) {
			addLog(attacker.name, 'has no weapon to attack with');
			return;
		}
		const usable = held.filter(
			(a) =>
				canSeeCharacter(attacker, victim) && (a.weapon.ranged || inMeleeReach(attacker, victim))
		);
		if (usable.length === 0) {
			addLog(attacker.name, `cannot reach ${victim.name}`);
			return;
		}
		if (!available.standard) {
			addLog(attacker.name, 'has no time left to attack');
			return;
		}
		spend('standard');

		let hurt = victim;
		for (const a of usable) {
			if (isDead(hurt)) break;
			const { check, damage } = rollAttack(a, hurt);
			hurt = takeAttack(hurt, damage);
			const outcome = check.success
				? `, ${damage} damage, ${hurt.hp.current}/${hurt.hp.max} HP left`
				: '';
			addLog(
				attacker.name,
				`attacks ${victim.name} with ${a.weapon.name}: ${formatCheck(check, 'AC')}${outcome}`
			);
		}

		if (isDead(hurt)) {
			characters = characters.filter((c) => c.id !== victim.id);
			turns = removeFromTurns(turns, victim.id);
			addLog(victim.name, 'dies');
		} else {
			characters = characters.map((c) => (c.id === victim.id ? hurt : c));
		}
	}

	function canSeeCharacter(viewer: Character, other: Character): boolean {
		return canSee(map, viewer, { description: other.name, point: other.position });
	}

	// Options stay in the terminal; whether they can still be carried out is checked when chosen
	function handleChoose(entry: number, option: LogOption) {
		if (active?.type !== 'PG' || animation) return;
		const { choice } = option;
		if (choice.kind === 'taunt' || choice.kind === 'diplomacy') {
			// One reply per conversation: talk again for another
			if (chooseTalk(active, choice)) removeOptions(entry, () => true);
		} else if (chooseContainer(active, choice)) {
			removeOptions(entry, (o) => o === option);
		}
	}

	// Returns whether the choice was carried out
	function chooseTalk(speaker: Character, choice: Extract<Choice, { characterId: string }>): boolean {
		const npc = characters.find((c) => c.id === choice.characterId);
		if (!npc?.mood) return false;
		if (!canSeeCharacter(speaker, npc)) {
			addLog(speaker.name, `cannot see ${npc.name}`);
			return false;
		}
		if (choice.kind === 'diplomacy' && npc.mood === 'friendly') {
			addLog(speaker.name, `speaks with ${npc.name}, who is already friendly`);
			return true;
		}
		const block = quickBlock(available);
		if (!block) {
			addLog(speaker.name, 'has no time left to talk');
			return false;
		}
		spend(block);

		if (choice.kind === 'taunt') {
			const mood = taunt(npc.mood);
			setMood(npc.id, mood);
			addLog(speaker.name, `taunts ${npc.name}, who ${moodChange(npc.mood, mood)}`);
		} else {
			const { mood, check } = diplomacy(speaker, npc);
			setMood(npc.id, mood);
			addLog(
				speaker.name,
				`tries diplomacy with ${npc.name}: ${formatCheck(check)}; ${npc.name} ${moodChange(npc.mood, mood)}`
			);
		}
		return true;
	}

	function moodChange(before: Mood, after: Mood): string {
		return before === after ? `stays ${after}` : `becomes ${after}`;
	}

	function setMood(id: string, mood: Mood) {
		characters = characters.map((c) => (c.id === id ? { ...c, mood } : c));
	}

	// Returns whether the choice was carried out
	function chooseContainer(taker: Character, choice: Extract<Choice, { objectId: string }>): boolean {
		const obj = map.objects.find((o) => o.id === choice.objectId);
		if (!obj) return false;
		if (!inReach(taker, obj)) {
			addLog(taker.name, 'is too far away to reach it');
			return false;
		}

		if (choice.kind === 'open') {
			map = openContainer(map, obj.id);
			const opened = map.objects.find((o) => o.id === obj.id)!;
			addLog(taker.name, `opens it and finds ${contentsText(opened)}`, containerOptions(opened));
		} else {
			const item = obj.contents?.find((i) => i.id === choice.itemId);
			if (!item) {
				addLog(taker.name, 'finds it is no longer there');
			} else {
				map = takeItem(map, obj.id, item.id);
				updateInventory(taker.id, addItem(taker.inventory, item));
				addLog(taker.name, `takes ${itemLabel(item)}`);
			}
		}
		return true;
	}

	function removeOptions(entry: number, removed: (option: LogOption) => boolean) {
		log = log.map((e, i) =>
			i === entry ? { ...e, options: e.options?.filter((o) => !removed(o)) } : e
		);
	}

	// Clicking a character or an object moves next to it, anywhere else moves to the point
	function move(target: Point) {
		if (!active) return;
		if (moveLeft <= 0) {
			addLog(active.name, 'has no time left to move');
			return;
		}
		const sighting = pick(map, characters, active, target);
		const thing = sighting?.character
			? {
					name: sighting.character.name,
					center: sighting.character.position,
					radius: characterRadius(sighting.character)
				}
			: sighting?.object
				? {
						name: sighting.object.description,
						center: sighting.object.center,
						radius: sighting.object.radius
					}
				: null;
		if (thing && isNextTo(active, thing.center, thing.radius)) {
			addLog(active.name, `is already next to ${thing.name}`);
			return;
		}
		let path = thing
			? findPathNextTo(map, characters, active, thing.center, thing.radius)
			: findPath(map, characters, active, target);
		if (!path) {
			addLog(active.name, thing ? `cannot get next to ${thing.name}` : 'cannot go there');
			return;
		}
		let meters = pathLength(active.position, path) / PIXELS_PER_METER;
		// Too far: walk the same path as far as the movement left allows
		const partial = meters > moveLeft;
		if (partial) {
			path = truncatePath(active.position, path, moveLeft * PIXELS_PER_METER);
			meters = moveLeft;
		}
		if (timed) {
			const next = spendMovement(turns, active.speed, meters);
			if (!next) {
				addLog(active.name, `cannot move that far (${meters.toFixed(1)} m)`);
				return;
			}
			turns = next;
		}
		const destination = path[path.length - 1];
		animation = startMove(active, path, performance.now());
		characters = moveCharacter(characters, active.id, destination);
		const where = partial
			? `towards ${thing ? thing.name : `(${Math.round(target.x)}, ${Math.round(target.y)})`}`
			: thing
				? `next to ${thing.name}`
				: `to (${Math.round(destination.x)}, ${Math.round(destination.y)})`;
		addLog(active.name, `moves ${where}, ${meters.toFixed(1)} m`);
	}

	// Equipping a weapon is a quick action, so only on the character's own turn; anything else is free
	function handleInventoryChange(owner: Character, inventory: Inventory, equipped?: Item) {
		if (equipped && isWeapon(equipped)) {
			if (owner.id !== active?.id) {
				addLog(owner.name, 'can only equip a weapon on their own turn');
				return;
			}
			const block = quickBlock(available);
			if (!block) {
				addLog(owner.name, 'has no time left to equip a weapon');
				return;
			}
			spend(block);
			addLog(owner.name, `equips ${equipped.name}`);
		}
		updateInventory(owner.id, inventory);
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
		bind:clientHeight={headerHeight}
		class="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b border-neutral-300 bg-white px-4 py-3"
	>
		<span class="text-sm text-neutral-500">Round {turns.round}</span>
		<button
			class="ml-auto rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40"
			disabled={active?.type !== 'PG' || animation !== null}
			onclick={handleEndTurn}
		>
			End turn
		</button>
	</header>

	<!-- A margin around the map lets it scroll past its edges: wide enough on the sides
	     to clear the turn order list, and at the bottom to clear the console -->
	<div bind:this={mapView} class="overflow-auto">
		<div class="mx-auto w-max px-60 pt-40 pb-60">
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
			<canvas
				bind:this={canvas}
				width={map.width}
				height={map.height}
				class="block border border-neutral-300 bg-white"
				onclick={handleMapClick}
			></canvas>
		</div>
	</div>

	<TurnOrder {turns} {characters} top={headerHeight + PANEL_GAP} />

	<div
		bind:clientHeight={consoleHeight}
		class="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-3"
	>
		<Toolbar bind:sheetOpen bind:inventoryOpen />
		<Terminal entries={log} onchoose={handleChoose} />
		{#if viewed}
			<LifeGauge hp={viewed.hp} />
			<!-- Outside its own turn the viewed PG has no time -->
			<TimeGauge actions={viewed.id === active?.id ? available : null} />
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
					onchange={(inventory, equipped) => handleInventoryChange(viewed, inventory, equipped)}
				/>
			</Panel>
		{/if}
	{/if}
</div>
