import type { GameMap } from '$lib/engine/types';

// Temporary hardcoded map, to be replaced by a real map source
export const map: GameMap = {
	width: 1600,
	height: 1200,
	walls: [
		// Great Hall (north-west), doors east and south
		{ from: { x: 100, y: 100 }, to: { x: 700, y: 100 } },
		{ from: { x: 100, y: 100 }, to: { x: 100, y: 550 } },
		{ from: { x: 700, y: 100 }, to: { x: 700, y: 300 } },
		{ from: { x: 700, y: 380 }, to: { x: 700, y: 550 } },
		{ from: { x: 100, y: 550 }, to: { x: 360, y: 550 } },
		{ from: { x: 440, y: 550 }, to: { x: 700, y: 550 } },

		// Library (north-east), doors west and south
		{ from: { x: 1000, y: 100 }, to: { x: 1500, y: 100 } },
		{ from: { x: 1500, y: 100 }, to: { x: 1500, y: 600 } },
		{ from: { x: 1000, y: 100 }, to: { x: 1000, y: 300 } },
		{ from: { x: 1000, y: 380 }, to: { x: 1000, y: 600 } },
		{ from: { x: 1000, y: 600 }, to: { x: 1260, y: 600 } },
		{ from: { x: 1340, y: 600 }, to: { x: 1500, y: 600 } },
		// Library bookshelves
		{ from: { x: 1150, y: 200 }, to: { x: 1400, y: 200 } },
		{ from: { x: 1150, y: 450 }, to: { x: 1400, y: 450 } },

		// Crypt (south), doors west and east
		{ from: { x: 500, y: 800 }, to: { x: 1200, y: 800 } },
		{ from: { x: 500, y: 1100 }, to: { x: 1200, y: 1100 } },
		{ from: { x: 500, y: 800 }, to: { x: 500, y: 870 } },
		{ from: { x: 500, y: 950 }, to: { x: 500, y: 1100 } },
		{ from: { x: 1200, y: 800 }, to: { x: 1200, y: 870 } },
		{ from: { x: 1200, y: 950 }, to: { x: 1200, y: 1100 } },

		// Corridor: Great Hall east door -> Library west door, with a dead end branching north
		{ from: { x: 700, y: 300 }, to: { x: 820, y: 300 } },
		{ from: { x: 880, y: 300 }, to: { x: 1000, y: 300 } },
		{ from: { x: 700, y: 380 }, to: { x: 1000, y: 380 } },
		{ from: { x: 820, y: 300 }, to: { x: 820, y: 150 } },
		{ from: { x: 880, y: 300 }, to: { x: 880, y: 150 } },
		{ from: { x: 820, y: 150 }, to: { x: 880, y: 150 } },

		// Corridor: Great Hall south door -> Crypt west door (L-shaped)
		{ from: { x: 360, y: 550 }, to: { x: 360, y: 950 } },
		{ from: { x: 360, y: 950 }, to: { x: 500, y: 950 } },
		{ from: { x: 440, y: 550 }, to: { x: 440, y: 870 } },
		{ from: { x: 440, y: 870 }, to: { x: 500, y: 870 } },

		// Corridor: Library south door -> Crypt east door (L-shaped)
		{ from: { x: 1340, y: 600 }, to: { x: 1340, y: 950 } },
		{ from: { x: 1200, y: 950 }, to: { x: 1340, y: 950 } },
		{ from: { x: 1260, y: 600 }, to: { x: 1260, y: 870 } },
		{ from: { x: 1200, y: 870 }, to: { x: 1260, y: 870 } }
	],
	objects: [
		// Great Hall pillars
		{ center: { x: 250, y: 220 }, radius: 25 },
		{ center: { x: 550, y: 220 }, radius: 25 },
		{ center: { x: 550, y: 450 }, radius: 25 },
		// Chest at the end of the dead-end corridor
		{ center: { x: 850, y: 180 }, radius: 15 },
		// Library reading table
		{ center: { x: 1250, y: 530 }, radius: 40 },
		// Crypt altar and pillars
		{ center: { x: 850, y: 860 }, radius: 30 },
		{ center: { x: 650, y: 950 }, radius: 30 },
		{ center: { x: 1050, y: 950 }, radius: 30 }
	]
};
