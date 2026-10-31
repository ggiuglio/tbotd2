import type { Point } from './types';

export function distance(a: Point, b: Point): number {
	return Math.hypot(b.x - a.x, b.y - a.y);
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
