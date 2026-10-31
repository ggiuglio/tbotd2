import { characterRadius } from '$lib/engine/characters';
import { distance } from '$lib/engine/geometry';
import type { LogOption } from '$lib/engine/log';
import type { Character, GameMap, Item, RoundObject } from '$lib/engine/types';

// How far from its edge a character can reach into a container
const REACH = 10;

export function inReach(character: Character, obj: RoundObject): boolean {
	return distance(character.position, obj.center) - obj.radius - characterRadius(character) <= REACH;
}

export function itemLabel(item: Item): string {
	return item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name;
}

export function contentsText(obj: RoundObject): string {
	return obj.contents?.length ? obj.contents.map(itemLabel).join(', ') : 'nothing';
}

// A closed container offers to open it, an open one to take each item inside
export function containerOptions(obj: RoundObject): LogOption[] {
	if (!obj.contents) return [];
	if (!obj.opened) return [{ label: 'Open', choice: { kind: 'open', objectId: obj.id } }];
	return obj.contents.map((item) => ({
		label: `Take ${itemLabel(item)}`,
		choice: { kind: 'take', objectId: obj.id, itemId: item.id }
	}));
}

export function openContainer(map: GameMap, objectId: string): GameMap {
	return {
		...map,
		objects: map.objects.map((o) => (o.id === objectId ? { ...o, opened: true } : o))
	};
}

// Removes the whole stack from the container
export function takeItem(map: GameMap, objectId: string, itemId: string): GameMap {
	return {
		...map,
		objects: map.objects.map((o) =>
			o.id === objectId ? { ...o, contents: o.contents?.filter((i) => i.id !== itemId) } : o
		)
	};
}
