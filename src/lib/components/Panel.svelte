<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		side,
		top,
		bottom,
		onclose,
		children
	}: {
		title: string;
		// Which half of the screen the panel covers
		side: 'left' | 'right';
		// Distance in pixels from the top and bottom of the viewport
		top: number;
		bottom: number;
		onclose: () => void;
		children: Snippet;
	} = $props();
</script>

<section
	class="paper ink fixed z-30 flex flex-col {side === 'left'
		? 'left-4 right-[calc(50%+8px)]'
		: 'left-[calc(50%+8px)] right-4'}"
	style:top="{top}px"
	style:bottom="{bottom}px"
>
	<header class="flex items-center justify-between border-b-2 border-[#2b2b3a]/20 px-6 py-3">
		<h2 class="text-2xl font-bold">{title}</h2>
		<button class="px-2 text-2xl leading-none hover:opacity-60" aria-label="Close" onclick={onclose}>
			×
		</button>
	</header>
	<div class="flex-1 overflow-y-auto px-6 py-4">
		{@render children()}
	</div>
</section>
