import type { Character } from './types';

export type TurnState = {
	// Character ids
	order: string[];
	current: number;
	round: number;
};

export function startTurns(characters: Character[]): TurnState {
	return { order: shuffle(characters.map((c) => c.id)), current: 0, round: 1 };
}

export function endTurn(state: TurnState): TurnState {
	const next = state.current + 1;
	if (next < state.order.length) return { ...state, current: next };
	return { ...state, current: 0, round: state.round + 1 };
}

export function activeId(state: TurnState): string | undefined {
	return state.order[state.current];
}

// Fisher-Yates, returns a new array
function shuffle<T>(items: T[]): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
