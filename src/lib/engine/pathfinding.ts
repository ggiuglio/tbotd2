import { distance } from './geometry';
import { fits, isPathClear } from './movement';
import type { Character, GameMap, Point } from './types';

// Size of a grid cell in pixels: smaller is more precise but slower
const CELL_SIZE = 10;
// How far (in cells) to look around the start and target for a cell to hook onto the grid
const HOOK_RANGE = 2;

// Returns the waypoints to walk through to reach the target (the target is the last one),
// or null when there is no way to get there
export function findPath(
	map: GameMap,
	characters: Character[],
	mover: Character,
	target: Point
): Point[] | null {
	const start = mover.position;
	if (isPathClear(map, characters, mover, start, target)) return [target];
	if (!fits(map, characters, mover, target)) return null;

	const cols = Math.ceil(map.width / CELL_SIZE);
	const rows = Math.ceil(map.height / CELL_SIZE);
	const center = (cell: number): Point => ({
		x: (cell % cols) * CELL_SIZE + CELL_SIZE / 2,
		y: Math.floor(cell / cols) * CELL_SIZE + CELL_SIZE / 2
	});

	const walkable = new Uint8Array(cols * rows);
	for (let cell = 0; cell < walkable.length; cell++) {
		walkable[cell] = fits(map, characters, mover, center(cell)) ? 1 : 0;
	}

	// Cells near a point that the mover can walk to from that point in a straight line
	const hooks = (point: Point, towardsPoint: boolean): number[] => {
		const col = Math.floor(point.x / CELL_SIZE);
		const row = Math.floor(point.y / CELL_SIZE);
		const result: number[] = [];
		for (let r = row - HOOK_RANGE; r <= row + HOOK_RANGE; r++) {
			for (let c = col - HOOK_RANGE; c <= col + HOOK_RANGE; c++) {
				if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
				const cell = r * cols + c;
				if (!walkable[cell]) continue;
				const clear = towardsPoint
					? isPathClear(map, characters, mover, center(cell), point)
					: isPathClear(map, characters, mover, point, center(cell));
				if (clear) result.push(cell);
			}
		}
		return result;
	};

	const startCells = hooks(start, false);
	const goalCells = new Set(hooks(target, true));
	if (startCells.length === 0 || goalCells.size === 0) return null;

	// A* over the grid, 8 directions
	const cost = new Float64Array(cols * rows).fill(Infinity);
	const cameFrom = new Int32Array(cols * rows).fill(-1);
	const open = new MinHeap();
	for (const cell of startCells) {
		cost[cell] = distance(start, center(cell));
		open.push(cell, cost[cell] + distance(center(cell), target));
	}

	let reached = -1;
	while (open.size > 0) {
		const cell = open.pop();
		if (goalCells.has(cell)) {
			reached = cell;
			break;
		}
		const col = cell % cols;
		const row = Math.floor(cell / cols);
		for (let dr = -1; dr <= 1; dr++) {
			for (let dc = -1; dc <= 1; dc++) {
				if (dr === 0 && dc === 0) continue;
				const c = col + dc;
				const r = row + dr;
				if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
				const next = r * cols + c;
				if (!walkable[next]) continue;
				// No cutting corners on diagonals
				if (dr !== 0 && dc !== 0 && (!walkable[row * cols + c] || !walkable[r * cols + col])) continue;
				const nextCost = cost[cell] + (dr !== 0 && dc !== 0 ? Math.SQRT2 : 1) * CELL_SIZE;
				if (nextCost >= cost[next]) continue;
				cost[next] = nextCost;
				cameFrom[next] = cell;
				open.push(next, nextCost + distance(center(next), target));
			}
		}
	}
	if (reached === -1) return null;

	const points: Point[] = [target];
	for (let cell = reached; cell !== -1; cell = cameFrom[cell]) points.push(center(cell));
	points.push(start);
	points.reverse();

	return smooth(points, (from, to) => isPathClear(map, characters, mover, from, to));
}

// From each point jump to the farthest later point reachable in a straight line.
// The start is dropped from the result.
function smooth(points: Point[], clear: (from: Point, to: Point) => boolean): Point[] {
	const result: Point[] = [];
	let i = 0;
	while (i < points.length - 1) {
		let j = points.length - 1;
		while (j > i + 1 && !clear(points[i], points[j])) j--;
		result.push(points[j]);
		i = j;
	}
	return result;
}

class MinHeap {
	private items: { value: number; priority: number }[] = [];

	get size() {
		return this.items.length;
	}

	push(value: number, priority: number) {
		const items = this.items;
		items.push({ value, priority });
		let i = items.length - 1;
		while (i > 0) {
			const parent = (i - 1) >> 1;
			if (items[parent].priority <= items[i].priority) break;
			[items[parent], items[i]] = [items[i], items[parent]];
			i = parent;
		}
	}

	pop(): number {
		const items = this.items;
		const top = items[0];
		const last = items.pop()!;
		if (items.length > 0) {
			items[0] = last;
			let i = 0;
			while (true) {
				const left = 2 * i + 1;
				const right = left + 1;
				let smallest = i;
				if (left < items.length && items[left].priority < items[smallest].priority) smallest = left;
				if (right < items.length && items[right].priority < items[smallest].priority) smallest = right;
				if (smallest === i) break;
				[items[smallest], items[i]] = [items[i], items[smallest]];
				i = smallest;
			}
		}
		return top.value;
	}
}
