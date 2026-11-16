import type { Character, Item } from '$lib/engine/types';

const BASE_AC = 10;

// Two-handed melee weapons get one and a half times the Strength modifier
const TWO_HANDED_STRENGTH = 1.5;

export function abilityModifier(score: number): number {
	return Math.floor((score - 10) / 2);
}

// Each part of the armor class, for showing how it is calculated
export type ArmorClass = {
	base: number;
	dex: number;
	// Null when no armor is worn
	armor: { item: Item; bonus: number } | null;
	// Every other equipped item with a bonus, e.g. shields, rings and amulets
	items: { item: Item; bonus: number }[];
	total: number;
};

// 10 + Dexterity modifier + armor bonus + bonuses of the other equipped items
export function armorClassBreakdown(character: Character): ArmorClass {
	const { body, ...others } = character.inventory.equipped;
	const dex = abilityModifier(character.abilities.dex);
	const armor = body ? { item: body, bonus: body.armorClassBonus ?? 0 } : null;
	// A two-handed weapon fills two slots but counts once
	const items = [...new Set(Object.values(others))]
		.filter((item) => item.armorClassBonus)
		.map((item) => ({ item, bonus: item.armorClassBonus ?? 0 }));
	const total =
		BASE_AC + dex + (armor?.bonus ?? 0) + items.reduce((sum, { bonus }) => sum + bonus, 0);
	return { base: BASE_AC, dex, armor, items, total };
}

export function armorClass(character: Character): number {
	return armorClassBreakdown(character).total;
}

// The bonus is added to the attack roll, the damage bonus to the damage dice
export type Attack = { weapon: Item; bonus: number; damageBonus: number };

// Null where nothing to attack with is held: a two-handed weapon fills twoHands and leaves the single hands empty
export type Attacks = {
	leftHand: Attack | null;
	rightHand: Attack | null;
	twoHands: Attack | null;
};

export function attacks(character: Character): Attacks {
	const { leftHand, rightHand } = character.inventory.equipped;
	const twoHanded = [leftHand, rightHand].find((item) => item?.type === 'twoHandedWeapon');
	if (twoHanded) {
		return { leftHand: null, rightHand: null, twoHands: attack(character, twoHanded) };
	}
	return {
		leftHand: leftHand?.type === 'weapon' ? attack(character, leftHand) : null,
		rightHand: rightHand?.type === 'weapon' ? attack(character, rightHand) : null,
		twoHands: null
	};
}

// Ranged: Dexterity + weapon bonus; melee: Strength + weapon bonus. Damage adds the same ability modifier
function attack(character: Character, weapon: Item): Attack {
	const ability = weapon.ranged
		? abilityModifier(character.abilities.dex)
		: meleeStrength(character, weapon);
	return { weapon, bonus: ability + (weapon.attackBonus ?? 0), damageBonus: ability };
}

// A penalty is not multiplied
function meleeStrength(character: Character, weapon: Item): number {
	const modifier = abilityModifier(character.abilities.str);
	if (weapon.type !== 'twoHandedWeapon' || modifier <= 0) return modifier;
	return Math.floor(modifier * TWO_HANDED_STRENGTH);
}
