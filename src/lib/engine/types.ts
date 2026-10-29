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

export type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export type AbilityScores = Record<Ability, number>;

export type HitPoints = { current: number; max: number };

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
	size: CharacterSize;
	position: Point;
	level: number;
	abilities: AbilityScores;
	hp: HitPoints;
	// Feet per turn
	speed: number;
	inventory: Inventory;
};
