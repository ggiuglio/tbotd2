export type Point = { x: number; y: number };

// Descriptions are what a character sees when looking at the thing, e.g. "a bare stone wall"
export type Wall = { from: Point; to: Point; description: string };

export type RoundObject = {
	id: string;
	center: Point;
	radius: number;
	description: string;
	// Items inside a container, e.g. a cabinet or a chest
	contents?: Item[];
	// Containers start closed: their contents are hidden until opened
	opened?: boolean;
};

export type GameMap = {
	width: number;
	height: number;
	walls: Wall[];
	objects: RoundObject[];
};

export type CharacterType = 'PG' | 'PNG';

export type CharacterSize = 'medium';

// How an NPC feels about the PGs, from best to worst
export type Mood = 'friendly' | 'neutral' | 'hostile';

export type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export type AbilityScores = Record<Ability, number>;

export type HitPoints = { current: number; max: number };

// e.g. { count: 2, sides: 6 } for 2d6
export type Dice = { count: number; sides: number };

export type ItemType =
	| 'weapon'
	| 'twoHandedWeapon'
	| 'shield'
	| 'armor'
	| 'amulet'
	| 'ring'
	| 'miscellanea';

export type Item = {
	id: string;
	name: string;
	type: ItemType;
	quantity: number;
	// Pounds per unit
	weight: number;
	// Base armor class, for armor only
	armorClass?: number;
	// Added to the armor class while equipped, e.g. by rings and amulets
	armorClassBonus?: number;
	// Weapons only: added to the attack, and whether it attacks at range rather than in melee
	attackBonus?: number;
	ranged?: boolean;
	// Weapons only: rolled on a hit
	damage?: Dice;
};

export type EquipmentSlot = 'neck' | 'leftFinger' | 'rightFinger' | 'body' | 'leftHand' | 'rightHand';

// Empty slots are omitted
export type Equipment = Partial<Record<EquipmentSlot, Item>>;

export type Inventory = {
	equipped: Equipment;
	carried: Item[];
};

export type Character = {
	id: string;
	name: string;
	type: CharacterType;
	// What others see when looking at the character, e.g. "a scrawny goblin"
	description: string;
	size: CharacterSize;
	position: Point;
	level: number;
	abilities: AbilityScores;
	hp: HitPoints;
	// Feet per turn
	speed: number;
	inventory: Inventory;
	// NPCs only
	mood?: Mood;
};
