import { characterRadius } from './characters';
import { closestPointOnSegment, distance, segmentsCross } from './geometry';
import type { Character, GameMap, Point, RoundObject, Wall } from './types';

// How far outside a wall, an object or a character a click still picks it
const PICK_TOLERANCE = 8;

// What a click picked: its description, the point to look at, and the wall, object or character it is if any
export type Sighting = {
	description: string;
	point: Point;
	wall?: Wall;
	object?: RoundObject;
	character?: Character;
};

// The thing closest to the point, ignoring the viewer, or undefined when the point is on bare floor
export function pick(
	map: GameMap,
	characters: Character[],
	viewer: Character,
	point: Point
): Sighting | undefined {
	let best: Sighting | undefined;
	let bestGap = PICK_TOLERANCE;
	// Gap between the point and the edge of the thing, negative inside it
	const consider = (gap: number, sighting: Sighting) => {
		if (gap > bestGap) return;
		best = sighting;
		bestGap = gap;
	};

	for (const wall of map.walls) {
		const closest = closestPointOnSegment(point, wall.from, wall.to);
		consider(distance(point, closest), { description: wall.description, point: closest, wall });
	}
	for (const obj of map.objects) {
		consider(distance(point, obj.center) - obj.radius, {
			description: obj.description,
			point: obj.center,
			object: obj
		});
	}
	for (const character of characters) {
		if (character.id === viewer.id) continue;
		consider(distance(point, character.position) - characterRadius(character), {
			description: character.mood
				? `${character.name}, ${character.description}, looking ${character.mood}`
				: `${character.name}, ${character.description}`,
			point: character.position,
			character
		});
	}

	return best;
}

// Walls block sight, except the one being looked at
export function canSee(map: GameMap, viewer: Character, sighting: Sighting): boolean {
	return !map.walls.some(
		(wall) =>
			wall !== sighting.wall &&
			segmentsCross(viewer.position, sighting.point, wall.from, wall.to)
	);
}
