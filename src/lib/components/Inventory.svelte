<script lang="ts">
	import { canEquip, equip, unequip } from '$lib/rules/inventory';
	import type { EquipmentSlot, Inventory, Item } from '$lib/engine/types';

	let {
		inventory,
		onchange
	}: {
		inventory: Inventory;
		// equipped is the item just put in a slot, if any
		onchange: (inventory: Inventory, equipped?: Item) => void;
	} = $props();

	// Laid out like a body facing the viewer, so the right hand is on the left.
	// Positions are in pixels inside the figure
	const SLOTS: { key: EquipmentSlot; label: string; x: number; y: number }[] = [
		{ key: 'neck', label: 'Neck', x: 104, y: 0 },
		{ key: 'rightHand', label: 'Right hand', x: 0, y: 104 },
		{ key: 'body', label: 'Body', x: 104, y: 104 },
		{ key: 'leftHand', label: 'Left hand', x: 208, y: 104 },
		{ key: 'rightFinger', label: 'Right finger', x: 0, y: 208 },
		{ key: 'leftFinger', label: 'Left finger', x: 208, y: 208 }
	];

	// What is being dragged: an item, and the slot it comes from when already equipped
	type Dragged = { item: Item; slot?: EquipmentSlot };

	let dragged = $state.raw<Dragged | null>(null);
	let over = $state<EquipmentSlot | 'list' | null>(null);

	// Every item the character owns, equipped first; a two-handed weapon fills two slots but is listed once
	let items = $derived.by(() => {
		const equipped = new Map<Item, EquipmentSlot>();
		for (const { key } of SLOTS) {
			const item = inventory.equipped[key];
			if (item && !equipped.has(item)) equipped.set(item, key);
		}
		return [
			...[...equipped].map(([item, slot]) => ({ item, slot })),
			...inventory.carried.map((item) => ({ item, slot: undefined }))
		];
	});

	function startDrag(event: DragEvent, item: Item, slot?: EquipmentSlot) {
		dragged = { item, slot };
		// Firefox needs some data to start a drag
		event.dataTransfer?.setData('text/plain', item.id);
	}

	function endDrag() {
		dragged = null;
		over = null;
	}

	function canDropOn(slot: EquipmentSlot): boolean {
		return dragged !== null && canEquip(dragged.item, slot);
	}

	function dragOverSlot(event: DragEvent, slot: EquipmentSlot) {
		if (!canDropOn(slot)) return;
		event.preventDefault();
		over = slot;
	}

	function dropOnSlot(event: DragEvent, slot: EquipmentSlot) {
		event.preventDefault();
		if (!dragged || !canDropOn(slot)) return;
		// An equipped item moving to another slot goes through carried first
		const source = dragged.slot ? unequip(inventory, dragged.slot) : inventory;
		onchange(equip(source, dragged.item.id, slot), dragged.item);
		endDrag();
	}

	// Only equipped items can be dropped back on the list
	function dragOverList(event: DragEvent) {
		if (!dragged?.slot) return;
		event.preventDefault();
		over = 'list';
	}

	function dropOnList(event: DragEvent) {
		event.preventDefault();
		if (dragged?.slot) onchange(unequip(inventory, dragged.slot));
		endDrag();
	}
</script>

<div class="flex flex-wrap gap-8">
	<section>
		<div class="figure">
			{#each SLOTS as { key, label, x, y }}
				{@const item = inventory.equipped[key]}
				<div
					class="slot"
					class:empty={!item}
					class:target={canDropOn(key)}
					class:over={over === key}
					style:left="{x}px"
					style:top="{y}px"
					title={label}
					role="listitem"
					draggable={item !== undefined}
					ondragstart={(e) => item && startDrag(e, item, key)}
					ondragend={endDrag}
					ondragover={(e) => dragOverSlot(e, key)}
					ondragleave={() => over === key && (over = null)}
					ondrop={(e) => dropOnSlot(e, key)}
				>
					<span class="label">{label}</span>
					{#if item}
						<span class="name">{item.name}</span>
						{#if item.type === 'twoHandedWeapon'}
							<span class="label">two-handed</span>
						{/if}
						<button
							class="unequip"
							aria-label="Unequip {item.name}"
							title="Unequip"
							onclick={() => onchange(unequip(inventory, key))}
						>
							×
						</button>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<section
		class="list min-w-48 flex-1"
		class:over={over === 'list'}
		aria-label="Items"
		ondragover={dragOverList}
		ondragleave={() => over === 'list' && (over = null)}
		ondrop={dropOnList}
	>
		<ul class="space-y-1">
			{#each items as { item, slot }}
				<li
					class="flex cursor-grab justify-between gap-4"
					class:opacity-40={dragged?.item === item}
					draggable={item.type !== 'miscellanea'}
					ondragstart={(e) => startDrag(e, item, slot)}
					ondragend={endDrag}
				>
					<span>
						{item.name}
						{#if item.quantity > 1}<span class="opacity-70">×{item.quantity}</span>{/if}
						{#if slot}<span class="text-sm opacity-60">equipped</span>{/if}
					</span>
					<span class="opacity-70">{Math.round(item.weight * item.quantity * 100) / 100} lb</span>
				</li>
			{:else}
				<li class="opacity-40">Nothing</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	.figure {
		position: relative;
		width: 296px;
		height: 296px;
	}

	.slot {
		position: absolute;
		width: 88px;
		height: 88px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4px;
		text-align: center;
		line-height: 1.1;
		background: #fdf8e8;
		border: 2px solid rgba(43, 43, 58, 0.7);
		border-radius: 14px 5px 12px 6px / 6px 12px 5px 14px;
	}

	.slot[draggable='true'] {
		cursor: grab;
	}

	.slot.empty {
		border-style: dashed;
		border-color: rgba(43, 43, 58, 0.35);
	}

	/* While dragging, slots that accept the item */
	.slot.target {
		border-color: #1f2a5c;
		background: #f3ecd2;
	}

	.slot.over,
	.list.over {
		background: rgba(31, 42, 92, 0.12);
	}

	.list {
		border-radius: 12px;
		padding: 4px 8px;
		margin: -4px -8px;
	}

	.unequip {
		position: absolute;
		top: 0;
		right: 4px;
		font-size: 1.1rem;
		line-height: 1;
		opacity: 0;
	}

	.slot:hover .unequip {
		opacity: 0.6;
	}

	.unequip:hover {
		opacity: 1 !important;
	}

	.label {
		font-size: 0.7rem;
		opacity: 0.6;
	}

	.name {
		font-weight: 700;
		font-size: 0.9rem;
	}
</style>
