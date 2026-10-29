import type { Character } from '$lib/engine/types';

// The time of a turn is split in three blocks: the standard block allows a standard action or a move,
// the move block only a move, the quick block only a quick action
export type ActionBlock = 'standard' | 'move' | 'quick';

// Whether each block is still available
export type Actions = Record<ActionBlock, boolean>;

const FULL_ACTIONS: Actions = { standard: true, move: true, quick: true };

export type TurnState = {
	// Character ids
	order: string[];
	current: number;
	round: number;
	// Time left to the active character
	actions: Actions;
};

export function startTurns(characters: Character[]): TurnState {
	return {
		order: shuffle(characters.map((c) => c.id)),
		current: 0,
		round: 1,
		actions: FULL_ACTIONS
	};
}

export function endTurn(state: TurnState): TurnState {
	const next = state.current + 1;
	if (next < state.order.length) return { ...state, current: next, actions: FULL_ACTIONS };
	return { ...state, current: 0, round: state.round + 1, actions: FULL_ACTIONS };
}

// The block a move uses: the move block first, so the standard one stays free for an action
export function moveBlock(actions: Actions): ActionBlock | undefined {
	if (actions.move) return 'move';
	if (actions.standard) return 'standard';
	return undefined;
}

export function spendAction(state: TurnState, block: ActionBlock): TurnState {
	return { ...state, actions: { ...state.actions, [block]: false } };
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
