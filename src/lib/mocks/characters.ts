import type { Character } from '$lib/engine/types';
import { inventories } from './inventories';

// Temporary hardcoded characters, to be replaced by a real source
export const characters: Character[] = [
	{
		id: 'aria',
		name: 'Aria',
		description: 'a lithe elf in a travel-stained green cloak, a bow slung across her back',
		type: 'PG',
		size: 'medium',
		position: { x: 150, y: 450 },
		level: 3,
		abilities: { str: 8, dex: 16, con: 12, int: 14, wis: 12, cha: 10 },
		hp: { current: 20, max: 20 },
		speed: 30,
		inventory: inventories.aria
	},
	{
		id: 'borin',
		name: 'Borin',
		description: 'a stocky dwarf in dented chainmail, his beard braided with iron rings',
		type: 'PG',
		size: 'medium',
		position: { x: 250, y: 470 },
		level: 3,
		abilities: { str: 16, dex: 10, con: 16, int: 8, wis: 13, cha: 10 },
		hp: { current: 31, max: 31 },
		speed: 25,
		inventory: inventories.borin
	},
	{
		id: 'goblin',
		name: 'Goblin',
		description: 'a scrawny goblin with yellow eyes and a notched blade',
		type: 'PNG',
		size: 'medium',
		position: { x: 850, y: 1000 },
		level: 1,
		abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
		hp: { current: 7, max: 7 },
		speed: 30,
		inventory: inventories.goblin,
		mood: 'hostile'
	},
	{
		id: 'innkeeper',
		name: 'Innkeeper',
		description: 'a nervous, round-faced man wiping his hands on a stained apron',
		type: 'PNG',
		size: 'medium',
		position: { x: 1420, y: 520 },
		level: 1,
		abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
		hp: { current: 4, max: 4 },
		speed: 30,
		inventory: inventories.innkeeper,
		mood: 'neutral'
	}
];
