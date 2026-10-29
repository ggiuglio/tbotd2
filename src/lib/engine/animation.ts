import { distance } from './geometry';
import type { Character, Point } from './types';

// Pixels per second
const MOVE_SPEED = 400;
const MIN_DURATION_MS = 150;

export type MoveAnimation = {
	id: string;
	// Starting position followed by the waypoints
	path: Point[];
	// Distance walked when reaching each point of the path
	distances: number[];
	start: number;
	duration: number;
};

export function startMove(character: Character, waypoints: Point[], now: number): MoveAnimation {
	const path = [character.position, ...waypoints];
	const distances = [0];
	for (let i = 1; i < path.length; i++) {
		distances.push(distances[i - 1] + distance(path[i - 1], path[i]));
	}
	const total = distances[distances.length - 1];
	const duration = Math.max(MIN_DURATION_MS, (total / MOVE_SPEED) * 1000);
	return { id: character.id, path, distances, start: now, duration };
}

export function isMoveFinished(animation: MoveAnimation, now: number): boolean {
	return progress(animation, now) >= 1;
}

// Characters as they should be drawn at the given time
export function applyMove(characters: Character[], animation: MoveAnimation, now: number): Character[] {
	const position = positionAt(animation, easeInOut(progress(animation, now)));
	return characters.map((c) => (c.id === animation.id ? { ...c, position } : c));
}

// Position along the path, t going from 0 (start) to 1 (end)
function positionAt(animation: MoveAnimation, t: number): Point {
	const { path, distances } = animation;
	const walked = t * distances[distances.length - 1];
	for (let i = 1; i < path.length; i++) {
		if (walked > distances[i]) continue;
		const length = distances[i] - distances[i - 1];
		const s = length === 0 ? 1 : (walked - distances[i - 1]) / length;
		const from = path[i - 1];
		const to = path[i];
		return { x: from.x + (to.x - from.x) * s, y: from.y + (to.y - from.y) * s };
	}
	return path[path.length - 1];
}

function progress(animation: MoveAnimation, now: number): number {
	return Math.max(0, Math.min(1, (now - animation.start) / animation.duration));
}

function easeInOut(t: number): number {
	return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}
