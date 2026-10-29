export type Point = { x: number; y: number };

export type Wall = { from: Point; to: Point };

export type RoundObject = { center: Point; radius: number };

export type GameMap = {
	width: number;
	height: number;
	walls: Wall[];
	objects: RoundObject[];
};

export type CharacterType = 'PG' | 'PNG';

export type CharacterSize = 'medium';

export type Character = {
	id: string;
	name: string;
	type: CharacterType;
	size: CharacterSize;
	position: Point;
};
