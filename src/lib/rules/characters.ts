import type { Character, Item } from '$lib/engine/types';

// Without armor
const UNARMORED_AC = 10;

const SHIELD_BONUS = 2;

// Two-handed melee weapons get one and a half times the Strength modifier
const TWO_HANDED_STRENGTH = 1.5;

export function abilityModifier(score: number): number {
	return Math.floor((score - 10) / 2);
}

// Base from the armor worn (or unarmored) + Dexterity modifier + shield bonus when holding one
// + bonuses of the equipped items, such as rings and amulets
export function armorClass(character: Character): number {
	const { equipped } = character.inventory;
	const base = equipped.body?.armorClass ?? UNARMORED_AC;
	const shield = [equipped.leftHand, equipped.rightHand].some((item) => item?.type === 'shield');
	// A two-handed weapon fills two slots but counts once
	const items = new Set(Object.values(equipped));
	const bonus = [...items].reduce((sum, item) => sum + (item.armorClassBonus ?? 0), 0);
	return base + abilityModifier(character.abilities.dex) + (shield ? SHIELD_BONUS : 0) + bonus;
}

export type Attack = { weapon: Item; bonus: number };

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

// Ranged: Dexterity + weapon bonus; melee: Strength + weapon bonus
function attack(character: Character, weapon: Item): Attack {
	const ability = weapon.ranged
		? abilityModifier(character.abilities.dex)
		: meleeStrength(character, weapon);
	return { weapon, bonus: ability + (weapon.attackBonus ?? 0) };
}

// A penalty is not multiplied
function meleeStrength(character: Character, weapon: Item): number {
	const modifier = abilityModifier(character.abilities.str);
	if (weapon.type !== 'twoHandedWeapon' || modifier <= 0) return modifier;
	return Math.floor(modifier * TWO_HANDED_STRENGTH);
}
