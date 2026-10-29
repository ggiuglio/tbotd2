import { characterRadius } from './characters';
import { distance, pointSegmentDistance, segmentDistance } from './geometry';
import type { Character, GameMap, Point } from './types';

// Half of the wall line width used in render
const WALL_HALF_THICKNESS = 2;

// The mover's circle fits at the point without touching a wall, an object or another character
export function fits(map: GameMap, characters: Character[], mover: Character, point: Point): boolean {
	const radius = characterRadius(mover);

	if (
		point.x < radius ||
		point.y < radius ||
		point.x > map.width - radius ||
		point.y > map.height - radius
	) {
		return false;
	}

	for (const wall of map.walls) {
		if (pointSegmentDistance(point, wall.from, wall.to) < radius + WALL_HALF_THICKNESS) return false;
	}

	for (const obj of map.objects) {
		if (distance(obj.center, point) < radius + obj.radius) return false;
	}

	for (const other of characters) {
		if (other.id === mover.id) continue;
		if (distance(other.position, point) < radius + characterRadius(other)) return false;
	}

	return true;
}

// The mover slides in a straight line from one point to the other:
// the path is blocked if the moving circle touches a wall, an object or another character
export function isPathClear(
	map: GameMap,
	characters: Character[],
	mover: Character,
	from: Point,
	to: Point
): boolean {
	if (!fits(map, characters, mover, to)) return false;

	const radius = characterRadius(mover);

	for (const wall of map.walls) {
		if (segmentDistance(from, to, wall.from, wall.to) < radius + WALL_HALF_THICKNESS) return false;
	}

	for (const obj of map.objects) {
		if (pointSegmentDistance(obj.center, from, to) < radius + obj.radius) return false;
	}

	for (const other of characters) {
		if (other.id === mover.id) continue;
		if (pointSegmentDistance(other.position, from, to) < radius + characterRadius(other)) {
			return false;
		}
	}

	return true;
}

export function moveCharacter(characters: Character[], id: string, target: Point): Character[] {
	return characters.map((c) => (c.id === id ? { ...c, position: target } : c));
}
