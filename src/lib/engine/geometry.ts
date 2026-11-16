import type { Point } from './types';

// Map scale: a medium character (40 pixels wide) takes about a meter and a half
export const PIXELS_PER_METER = 25;

export function distance(a: Point, b: Point): number {
	return Math.hypot(b.x - a.x, b.y - a.y);
}

// Length of the path from the start through every waypoint
export function pathLength(start: Point, waypoints: Point[]): number {
	let length = 0;
	let from = start;
	for (const to of waypoints) {
		length += distance(from, to);
		from = to;
	}
	return length;
}

// The same path cut short after the given length: the waypoints up to there, ending at the cut point
export function truncatePath(start: Point, waypoints: Point[], length: number): Point[] {
	const result: Point[] = [];
	let from = start;
	let left = length;
	for (const to of waypoints) {
		const step = distance(from, to);
		if (step >= left) {
			const t = step === 0 ? 0 : left / step;
			result.push({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
			return result;
		}
		result.push(to);
		left -= step;
		from = to;
	}
	return result;
}

export function closestPointOnSegment(p: Point, a: Point, b: Point): Point {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const lengthSq = dx * dx + dy * dy;
	if (lengthSq === 0) return a;
	const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq));
	return { x: a.x + t * dx, y: a.y + t * dy };
}

export function pointSegmentDistance(p: Point, a: Point, b: Point): number {
	return distance(p, closestPointOnSegment(p, a, b));
}

export function segmentDistance(a: Point, b: Point, c: Point, d: Point): number {
	if (segmentsCross(a, b, c, d)) return 0;
	return Math.min(
		pointSegmentDistance(a, c, d),
		pointSegmentDistance(b, c, d),
		pointSegmentDistance(c, a, b),
		pointSegmentDistance(d, a, b)
	);
}

// Strict crossing only; touching and collinear cases are covered by the point distances
export function segmentsCross(a: Point, b: Point, c: Point, d: Point): boolean {
	const o1 = cross(a, b, c);
	const o2 = cross(a, b, d);
	const o3 = cross(c, d, a);
	const o4 = cross(c, d, b);
	return o1 * o2 < 0 && o3 * o4 < 0;
}

function cross(o: Point, a: Point, b: Point): number {
	return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}
