import { characterRadius } from './characters';
import type { Character, CharacterType, GameMap, Mood } from './types';

const TYPE_COLOR: Record<CharacterType, string> = {
	PG: '#1e88e5',
	PNG: '#e53935'
};

// NPCs with a mood are drawn in its color instead of their type's
export const MOOD_COLOR: Record<Mood, string> = {
	friendly: '#2e7d32',
	neutral: '#757575',
	hostile: '#e53935'
};

const ACTIVE_COLOR = '#f9a825';

export function render(
	ctx: CanvasRenderingContext2D,
	map: GameMap,
	characters: Character[],
	activeId?: string
) {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctx.strokeStyle = '#333';
	ctx.lineWidth = 4;
	ctx.lineCap = 'round';
	for (const wall of map.walls) {
		ctx.beginPath();
		ctx.moveTo(wall.from.x, wall.from.y);
		ctx.lineTo(wall.to.x, wall.to.y);
		ctx.stroke();
	}

	ctx.strokeStyle = '#4e342e';
	ctx.lineWidth = 2;
	for (const obj of map.objects) {
		ctx.beginPath();
		ctx.arc(obj.center.x, obj.center.y, obj.radius, 0, Math.PI * 2);
		ctx.stroke();
	}

	ctx.lineWidth = 3;
	ctx.font = '12px sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'top';
	for (const character of characters) {
		const radius = characterRadius(character);
		const color = character.mood ? MOOD_COLOR[character.mood] : TYPE_COLOR[character.type];
		if (character.id === activeId) {
			ctx.strokeStyle = ACTIVE_COLOR;
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.arc(character.position.x, character.position.y, radius + 6, 0, Math.PI * 2);
			ctx.stroke();
			ctx.lineWidth = 3;
		}
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.arc(character.position.x, character.position.y, radius, 0, Math.PI * 2);
		ctx.stroke();
		ctx.fillStyle = color;
		const label = character.mood ? `${character.name} (${character.mood})` : character.name;
		ctx.fillText(label, character.position.x, character.position.y + radius + 4);
	}
}
