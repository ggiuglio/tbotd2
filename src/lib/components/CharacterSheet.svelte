<script lang="ts">
	import { abilityModifier, armorClass, attacks, type Attacks } from '$lib/rules/characters';
	import type { Ability, Character } from '$lib/engine/types';

	let { character }: { character: Character } = $props();

	const ABILITIES: { key: Ability; label: string }[] = [
		{ key: 'str', label: 'STR' },
		{ key: 'dex', label: 'DEX' },
		{ key: 'con', label: 'CON' },
		{ key: 'int', label: 'INT' },
		{ key: 'wis', label: 'WIS' },
		{ key: 'cha', label: 'CHA' }
	];

	const HANDS: { key: keyof Attacks; label: string }[] = [
		{ key: 'rightHand', label: 'Right hand' },
		{ key: 'leftHand', label: 'Left hand' },
		{ key: 'twoHands', label: 'Two hands' }
	];

	// Only the hands that can attack
	let weaponAttacks = $derived.by(() => {
		const all = attacks(character);
		return HANDS.flatMap(({ key, label }) => {
			const attack = all[key];
			return attack ? [{ ...attack, label }] : [];
		});
	});

	function signed(value: number): string {
		return value >= 0 ? `+${value}` : `${value}`;
	}
</script>

<div class="space-y-6">
	<div>
		<div class="text-3xl font-bold">{character.name}</div>
		<div class="opacity-70">Level {character.level} · {character.type} · {character.size}</div>
	</div>

	<dl class="grid grid-cols-3 gap-3 text-center">
		<div class="stat">
			<dt>HP</dt>
			<dd>{character.hp.current}/{character.hp.max}</dd>
		</div>
		<div class="stat">
			<dt>AC</dt>
			<dd>{armorClass(character)}</dd>
		</div>
		<div class="stat">
			<dt>Speed</dt>
			<dd>{character.speed} ft</dd>
		</div>
	</dl>

	<dl class="grid grid-cols-3 gap-3 text-center sm:grid-cols-6">
		{#each ABILITIES as { key, label }}
			<div class="stat">
				<dt>{label}</dt>
				<dd>{signed(abilityModifier(character.abilities[key]))}</dd>
				<div class="text-sm opacity-70">{character.abilities[key]}</div>
			</div>
		{/each}
	</dl>

	<section>
		<h3 class="mb-2 text-xl font-bold">Attacks</h3>
		<ul class="space-y-1">
			{#each weaponAttacks as { weapon, bonus, label }}
				<li class="flex justify-between gap-4">
					<span>
						{weapon.name}
						<span class="text-sm opacity-60">{label} · {weapon.ranged ? 'ranged' : 'melee'}</span>
					</span>
					<span class="font-bold">{signed(bonus)}</span>
				</li>
			{:else}
				<li class="opacity-40">No weapon</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	.stat {
		border: 2px solid rgba(43, 43, 58, 0.6);
		border-radius: 18px 6px 16px 8px / 8px 16px 6px 18px;
		padding: 6px 4px;
	}

	dt {
		font-size: 0.85rem;
		font-weight: 700;
		opacity: 0.7;
	}

	dd {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.2;
	}
</style>
