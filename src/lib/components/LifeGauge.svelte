<script lang="ts">
	import type { HitPoints } from '$lib/engine/types';

	let { hp }: { hp: HitPoints } = $props();

	let ratio = $derived(Math.min(Math.max(hp.current / hp.max, 0), 1));
</script>

<div
	class="paper ink flex w-16 flex-col items-center gap-1 py-2"
	title="Hit points"
	role="meter"
	aria-label="Hit points"
	aria-valuemin={0}
	aria-valuemax={hp.max}
	aria-valuenow={hp.current}
>
	<!-- Fills from the bottom, red for the HP left -->
	<div class="vial">
		<div class="fill" style:height="{ratio * 100}%"></div>
	</div>
	<span class="text-sm font-bold leading-none">{hp.current}/{hp.max}</span>
</div>

<style>
	.vial {
		position: relative;
		flex: 1;
		width: 32px;
		border: 2px solid rgba(43, 43, 58, 0.7);
		border-radius: 14px 10px 12px 9px / 9px 12px 10px 14px;
		overflow: hidden;
	}

	.fill {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: #c0392b;
		transition: height 0.4s ease;
	}
</style>
