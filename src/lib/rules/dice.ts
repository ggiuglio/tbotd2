// Sum of count dice with the given number of sides, e.g. roll(2, 6) for 2d6
export function roll(count: number, sides: number): number {
	let total = 0;
	for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
	return total;
}

export function d20(): number {
	return roll(1, 20);
}
