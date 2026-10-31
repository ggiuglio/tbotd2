import type { GameMap } from '$lib/engine/types';

// Temporary hardcoded map, to be replaced by a real map source
export const map: GameMap = {
	width: 1600,
	height: 1200,
	walls: [
		// Great Hall (north-west), doors east and south
		{
			from: { x: 100, y: 100 },
			to: { x: 700, y: 100 },
			description: 'a long stone wall hung with faded tapestries of a stag hunt'
		},
		{
			from: { x: 100, y: 100 },
			to: { x: 100, y: 550 },
			description: 'a wide hearth, cold and full of old ashes'
		},
		{ from: { x: 700, y: 100 }, to: { x: 700, y: 300 }, description: 'a bare stone wall' },
		{
			from: { x: 700, y: 380 },
			to: { x: 700, y: 550 },
			description: 'a stone wall with an empty torch sconce'
		},
		{
			from: { x: 100, y: 550 },
			to: { x: 360, y: 550 },
			description: 'a heavy oak cabinet against the wall, its doors shut'
		},
		{ from: { x: 440, y: 550 }, to: { x: 700, y: 550 }, description: 'a bare stone wall' },

		// Library (north-east), doors west and south
		{
			from: { x: 1000, y: 100 },
			to: { x: 1500, y: 100 },
			description: 'bookshelves from floor to ceiling, crammed with dusty tomes'
		},
		{
			from: { x: 1500, y: 100 },
			to: { x: 1500, y: 600 },
			description: 'bookshelves full of swollen, damp-rotted volumes'
		},
		{ from: { x: 1000, y: 100 }, to: { x: 1000, y: 300 }, description: 'a plain plastered wall' },
		{
			from: { x: 1000, y: 380 },
			to: { x: 1000, y: 600 },
			description: 'a glass-fronted cabinet holding rolled maps and scrolls'
		},
		{
			from: { x: 1000, y: 600 },
			to: { x: 1260, y: 600 },
			description: 'a plastered wall, cracked from floor to ceiling'
		},
		{ from: { x: 1340, y: 600 }, to: { x: 1500, y: 600 }, description: 'a plain plastered wall' },
		// Library bookshelves
		{
			from: { x: 1150, y: 200 },
			to: { x: 1400, y: 200 },
			description: 'a freestanding bookshelf of histories and genealogies'
		},
		{
			from: { x: 1150, y: 450 },
			to: { x: 1400, y: 450 },
			description: 'a freestanding bookshelf, half empty, with gaps where books were taken'
		},

		// Crypt (south), doors west and east
		{
			from: { x: 500, y: 800 },
			to: { x: 1200, y: 800 },
			description: 'a rough-hewn wall carved with the names of the dead'
		},
		{
			from: { x: 500, y: 1100 },
			to: { x: 1200, y: 1100 },
			description: 'a row of burial niches, each holding a shrouded body'
		},
		{
			from: { x: 500, y: 800 },
			to: { x: 500, y: 870 },
			description: 'a damp stone wall slick with moss'
		},
		{
			from: { x: 500, y: 950 },
			to: { x: 500, y: 1100 },
			description: 'a damp stone wall slick with moss'
		},
		{
			from: { x: 1200, y: 800 },
			to: { x: 1200, y: 870 },
			description: 'a cold stone wall, scratched by something with claws'
		},
		{ from: { x: 1200, y: 950 }, to: { x: 1200, y: 1100 }, description: 'a cold stone wall' },

		// Corridor: Great Hall east door -> Library west door, with a dead end branching north
		{ from: { x: 700, y: 300 }, to: { x: 820, y: 300 }, description: 'a bare corridor wall' },
		{ from: { x: 880, y: 300 }, to: { x: 1000, y: 300 }, description: 'a bare corridor wall' },
		{
			from: { x: 700, y: 380 },
			to: { x: 1000, y: 380 },
			description: 'a corridor wall lined with faded portraits'
		},
		{ from: { x: 820, y: 300 }, to: { x: 820, y: 150 }, description: 'a bare corridor wall' },
		{ from: { x: 880, y: 300 }, to: { x: 880, y: 150 }, description: 'a bare corridor wall' },
		{
			from: { x: 820, y: 150 },
			to: { x: 880, y: 150 },
			description: 'the blank wall where the corridor ends'
		},

		// Corridor: Great Hall south door -> Crypt west door (L-shaped)
		{
			from: { x: 360, y: 550 },
			to: { x: 360, y: 950 },
			description: 'a narrow stair wall, cold to the touch'
		},
		{ from: { x: 360, y: 950 }, to: { x: 500, y: 950 }, description: 'a bare stone wall' },
		{
			from: { x: 440, y: 550 },
			to: { x: 440, y: 870 },
			description: 'a narrow stair wall, cold to the touch'
		},
		{ from: { x: 440, y: 870 }, to: { x: 500, y: 870 }, description: 'a bare stone wall' },

		// Corridor: Library south door -> Crypt east door (L-shaped)
		{ from: { x: 1340, y: 600 }, to: { x: 1340, y: 950 }, description: 'a bare corridor wall' },
		{ from: { x: 1200, y: 950 }, to: { x: 1340, y: 950 }, description: 'a bare corridor wall' },
		{
			from: { x: 1260, y: 600 },
			to: { x: 1260, y: 870 },
			description: 'a corridor wall with a niche holding a melted candle'
		},
		{ from: { x: 1200, y: 870 }, to: { x: 1260, y: 870 }, description: 'a bare corridor wall' }
	],
	objects: [
		// Great Hall columns and armchair
		{
			id: 'hall-column-1',
			center: { x: 250, y: 220 },
			radius: 25,
			description: 'a massive stone column holding up the vaulted ceiling'
		},
		{
			id: 'hall-column-2',
			center: { x: 550, y: 220 },
			radius: 25,
			description: 'a stone column, its base chipped and scorched'
		},
		{
			id: 'hall-armchair',
			center: { x: 550, y: 450 },
			radius: 25,
			description: 'a worn leather armchair facing the cold hearth'
		},
		// Chest at the end of the dead-end corridor
		{
			id: 'corridor-chest',
			center: { x: 850, y: 180 },
			radius: 15,
			description: 'a small iron-bound chest',
			contents: [
				{ id: 'silver-dagger', name: 'Silver Dagger', type: 'weapon', quantity: 1, weight: 1, attackBonus: 1, damage: { count: 1, sides: 4 } },
				{ id: 'ring-of-warding', name: 'Ring of Warding', type: 'ring', quantity: 1, weight: 0, armorClassBonus: 1 },
				{ id: 'torch', name: 'Torch', type: 'miscellanea', quantity: 3, weight: 1 }
			]
		},
		// Library cabinet by the west door
		{
			id: 'library-cabinet',
			center: { x: 1050, y: 160 },
			radius: 20,
			description: 'a small walnut cabinet with a cracked door',
			contents: [
				{ id: 'healing-potion', name: 'Potion of Healing', type: 'miscellanea', quantity: 1, weight: 0.5 },
				{ id: 'silver-key', name: 'Silver Key', type: 'miscellanea', quantity: 1, weight: 0 },
				{ id: 'gold-coin', name: 'Gold Coin', type: 'miscellanea', quantity: 12, weight: 0.02 }
			]
		},
		// Library reading table
		{
			id: 'library-table',
			center: { x: 1250, y: 530 },
			radius: 40,
			description: 'a round reading table with a book left open on it'
		},
		// Crypt altar and columns
		{ id: 'crypt-altar', center: { x: 850, y: 860 }, radius: 30, description: 'a low stone altar stained dark' },
		{ id: 'crypt-column-1', center: { x: 650, y: 950 }, radius: 30, description: 'a squat column carved with skulls' },
		{ id: 'crypt-column-2', center: { x: 1050, y: 950 }, radius: 30, description: 'a squat column carved with skulls' }
	]
};
