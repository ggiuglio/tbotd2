import { characterRadius } from '$lib/engine/characters';
import { distance } from '$lib/engine/geometry';
import type { Character } from '$lib/engine/types';
import { attacks, armorClass, type Attack } from './characters';
import { check, type CheckResult } from './checks';
import { roll } from './dice';

// How far apart the edges of two characters can be for a melee attack
const MELEE_REACH = 10;

export function inMeleeReach(attacker: Character, target: Character): boolean {
	return (
		distance(attacker.position, target.position) -
			characterRadius(attacker) -
			characterRadius(target) <=
		MELEE_REACH
	);
}

// Every weapon held attacks: one per hand, or one for a two-handed weapon
export function heldAttacks(character: Character): Attack[] {
	const { leftHand, rightHand, twoHands } = attacks(character);
	return [rightHand, leftHand, twoHands].filter((a) => a !== null);
}

export type AttackResult = { check: CheckResult; damage: number };

// d20 + attack bonus against the target's AC; a hit deals the weapon dice + the damage bonus, never below 0
export function rollAttack(attack: Attack, target: Character): AttackResult {
	const result = check(attack.bonus, armorClass(target));
	if (!result.success) return { check: result, damage: 0 };
	const dice = attack.weapon.damage;
	const rolled = dice ? roll(dice.count, dice.sides) : 0;
	return { check: result, damage: Math.max(0, rolled + attack.damageBonus) };
}

// An attacked NPC turns hostile, hit or miss
export function takeAttack(target: Character, damage: number): Character {
	return {
		...target,
		hp: { ...target.hp, current: Math.max(0, target.hp.current - damage) },
		mood: target.mood ? 'hostile' : undefined
	};
}

// Time is limited only while at least one NPC is hostile
export function inCombat(characters: Character[]): boolean {
	return characters.some((c) => c.type === 'PNG' && c.mood === 'hostile');
}

export function isDead(character: Character): boolean {
	return character.hp.current <= 0;
}
