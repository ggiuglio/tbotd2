import type { Character } from '$lib/engine/types';

// Temporary hardcoded characters, to be replaced by a real source
export const characters: Character[] = [
	{ id: 'aria', name: 'Aria', type: 'PG', size: 'medium', position: { x: 150, y: 450 } },
	{ id: 'borin', name: 'Borin', type: 'PG', size: 'medium', position: { x: 250, y: 470 } },
	{ id: 'goblin', name: 'Goblin', type: 'PNG', size: 'medium', position: { x: 850, y: 1000 } },
	{ id: 'innkeeper', name: 'Innkeeper', type: 'PNG', size: 'medium', position: { x: 1420, y: 520 } }
];
