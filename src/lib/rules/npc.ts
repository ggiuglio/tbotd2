import { endTurn, type TurnState } from './turns';

// First NPC intelligence: do nothing and pass the turn
export function npcTurn(turns: TurnState): TurnState {
	return endTurn(turns);
}
