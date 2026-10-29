import type { Inventory, Item } from '$lib/engine/types';

const ariaShortbow: Item = {
	id: 'shortbow',
	name: 'Shortbow',
	type: 'twoHandedWeapon',
	quantity: 1,
	weight: 2,
	ranged: true
};

// Temporary hardcoded inventories, keyed by character id
export const inventories: Record<string, Inventory> = {
	aria: {
		equipped: {
			// A two-handed weapon fills both hands
			rightHand: ariaShortbow,
			leftHand: ariaShortbow,
			body: { id: 'leather-armor', name: 'Leather Armor', type: 'armor', quantity: 1, weight: 10, armorClass: 11 },
			rightFinger: { id: 'ring-of-protection', name: 'Ring of Protection', type: 'ring', quantity: 1, weight: 0, armorClassBonus: 1 }
		},
		carried: [
			{ id: 'arrow', name: 'Arrow', type: 'miscellanea', quantity: 20, weight: 0.05 },
			{ id: 'dagger', name: 'Dagger', type: 'weapon', quantity: 2, weight: 1 },
			{ id: 'healing-potion', name: 'Potion of Healing', type: 'miscellanea', quantity: 1, weight: 0.5 }
		]
	},
	borin: {
		equipped: {
			rightHand: { id: 'battleaxe', name: 'Battleaxe', type: 'weapon', quantity: 1, weight: 4 },
			leftHand: { id: 'shield', name: 'Shield', type: 'shield', quantity: 1, weight: 6 },
			body: { id: 'chain-mail', name: 'Chain Mail', type: 'armor', quantity: 1, weight: 55, armorClass: 16 },
			neck: { id: 'amulet-of-health', name: 'Amulet of Health', type: 'amulet', quantity: 1, weight: 0 }
		},
		carried: [{ id: 'rations', name: 'Rations', type: 'miscellanea', quantity: 5, weight: 2 }]
	},
	goblin: {
		equipped: {
			rightHand: { id: 'scimitar', name: 'Scimitar', type: 'weapon', quantity: 1, weight: 3 },
			leftHand: { id: 'shield', name: 'Shield', type: 'shield', quantity: 1, weight: 6 },
			body: { id: 'leather-armor', name: 'Leather Armor', type: 'armor', quantity: 1, weight: 10, armorClass: 11 }
		},
		carried: [
			{ id: 'shortbow', name: 'Shortbow', type: 'twoHandedWeapon', quantity: 1, weight: 2, ranged: true },
			{ id: 'arrow', name: 'Arrow', type: 'miscellanea', quantity: 10, weight: 0.05 }
		]
	},
	innkeeper: {
		equipped: {},
		carried: [
			{ id: 'club', name: 'Club', type: 'weapon', quantity: 1, weight: 2 },
			{ id: 'ale', name: 'Mug of Ale', type: 'miscellanea', quantity: 3, weight: 1 }
		]
	}
};
