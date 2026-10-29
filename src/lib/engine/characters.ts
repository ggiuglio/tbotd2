import type { Character, CharacterSize } from './types';

const SIZE_RADIUS: Record<CharacterSize, number> = {
	medium: 20
};

export function characterRadius(character: Character): number {
	return SIZE_RADIUS[character.size];
}
