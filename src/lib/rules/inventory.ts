import type { EquipmentSlot, Inventory, Item, ItemType } from '$lib/engine/types';

// For each item type, the alternative sets of slots it can fill:
// an item is equipped in every slot of one set at once
const SLOT_RULES: Record<ItemType, EquipmentSlot[][]> = {
	weapon: [['rightHand'], ['leftHand']],
	twoHandedWeapon: [['rightHand', 'leftHand']],
	shield: [['leftHand'], ['rightHand']],
	armor: [['body']],
	amulet: [['neck']],
	ring: [['rightFinger'], ['leftFinger']],
	miscellanea: []
};

// The slots an item of this type fills when equipped in the given slot
export function slotsFor(type: ItemType, slot: EquipmentSlot): EquipmentSlot[] | undefined {
	return SLOT_RULES[type].find((slots) => slots.includes(slot));
}

export function isWeapon(item: Item): boolean {
	return item.type === 'weapon' || item.type === 'twoHandedWeapon';
}

export function canEquip(item: Item, slot: EquipmentSlot): boolean {
	return slotsFor(item.type, slot) !== undefined;
}

// Moves one unit of a carried item into the slot: whatever occupied the slots it fills goes back to carried
export function equip(inventory: Inventory, itemId: string, slot: EquipmentSlot): Inventory {
	const item = inventory.carried.find((i) => i.id === itemId);
	if (!item) return inventory;

	const slots = slotsFor(item.type, slot);
	if (!slots) return inventory;

	let result = inventory;
	for (const s of slots) result = unequip(result, s);

	const piece: Item = { ...item, quantity: 1 };
	const equipped = { ...result.equipped };
	for (const s of slots) equipped[s] = piece;

	const carried = result.carried.flatMap((i) => {
		if (i.id !== itemId) return [i];
		return i.quantity > 1 ? [{ ...i, quantity: i.quantity - 1 }] : [];
	});

	return { equipped, carried };
}

// Moves the item in the slot back to carried, freeing every slot it fills
export function unequip(inventory: Inventory, slot: EquipmentSlot): Inventory {
	const item = inventory.equipped[slot];
	if (!item) return inventory;

	const equipped = { ...inventory.equipped };
	for (const s of slotsFor(item.type, slot) ?? [slot]) delete equipped[s];

	return { equipped, carried: addToCarried(inventory.carried, item) };
}

export function addItem(inventory: Inventory, item: Item): Inventory {
	return { ...inventory, carried: addToCarried(inventory.carried, item) };
}

// Merges the item into an existing stack with the same id
function addToCarried(carried: Item[], item: Item): Item[] {
	const stack = carried.find((i) => i.id === item.id);
	if (!stack) return [...carried, item];
	return carried.map((i) => (i === stack ? { ...i, quantity: i.quantity + item.quantity } : i));
}
