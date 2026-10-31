import type { LogOption } from '$lib/engine/log';
import type { Character, Mood } from '$lib/engine/types';
import { abilityCheck, type CheckResult } from './checks';

// From best to worst: taunting moves one step right, diplomacy one step left
const MOODS: Mood[] = ['friendly', 'neutral', 'hostile'];

const DIPLOMACY_BASE_DC = 15;

export function talkOptions(npc: Character): LogOption[] {
	return [
		{ label: 'Taunt', choice: { kind: 'taunt', characterId: npc.id } },
		{ label: 'Diplomacy', choice: { kind: 'diplomacy', characterId: npc.id } }
	];
}

export function taunt(mood: Mood): Mood {
	return shift(mood, 1);
}

// Harder the more HP the NPC has lost
export function diplomacyDC(npc: Character): number {
	return DIPLOMACY_BASE_DC + npc.hp.max - npc.hp.current;
}

// Charisma check against the NPC's diplomacy DC: on a success the mood improves one step
export function diplomacy(speaker: Character, npc: Character): { mood: Mood; check: CheckResult } {
	const mood = npc.mood ?? 'neutral';
	const check = abilityCheck(speaker, 'cha', diplomacyDC(npc));
	return { mood: check.success ? shift(mood, -1) : mood, check };
}

function shift(mood: Mood, steps: number): Mood {
	const index = Math.max(0, Math.min(MOODS.length - 1, MOODS.indexOf(mood) + steps));
	return MOODS[index];
}
