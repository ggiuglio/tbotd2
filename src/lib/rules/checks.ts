import type { Ability, Character } from '$lib/engine/types';
import { abilityModifier } from './characters';
import { d20 } from './dice';

export type CheckResult = {
	roll: number;
	modifier: number;
	total: number;
	dc: number;
	success: boolean;
};

// d20 + modifier, passed when the total reaches the DC
export function check(modifier: number, dc: number): CheckResult {
	const rolled = d20();
	const total = rolled + modifier;
	return { roll: rolled, modifier, total, dc, success: total >= dc };
}

export function abilityCheck(character: Character, ability: Ability, dc: number): CheckResult {
	return check(abilityModifier(character.abilities[ability]), dc);
}

// What the DC is called in the text, e.g. AC for attacks
export function formatCheck(result: CheckResult, against = 'DC'): string {
	const sign = result.modifier < 0 ? '-' : '+';
	const outcome = result.success ? 'success' : 'failure';
	return `${result.roll} ${sign} ${Math.abs(result.modifier)} = ${result.total} vs ${against} ${result.dc}, ${outcome}`;
}
