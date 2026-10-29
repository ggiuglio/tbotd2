<script module lang="ts">
	// What a click on the map does
	export type ActionMode = 'look' | 'talk' | 'move' | 'attack';
</script>

<script lang="ts">
	let { mode = $bindable() }: { mode: ActionMode } = $props();
</script>

<nav class="paper grid w-28 grid-cols-2 place-content-center place-items-center gap-1 py-2" aria-label="Actions">
	<!-- Not implemented yet -->
	<button class="icon-button" title="Look (coming soon)" aria-label="Look" disabled>
		<!-- Eye -->
		<svg viewBox="0 0 24 24">
			<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
			<circle cx="12" cy="12" r="2.5" />
		</svg>
	</button>
	<button class="icon-button" title="Talk (coming soon)" aria-label="Talk" disabled>
		<!-- Speech bubble -->
		<svg viewBox="0 0 24 24">
			<path d="M4 5h16v11H10l-4 4v-4H4z" />
			<path d="M8 9h8M8 12h5" />
		</svg>
	</button>
	<button
		class="icon-button"
		class:selected={mode === 'move'}
		title="Move"
		aria-label="Move"
		aria-pressed={mode === 'move'}
		onclick={() => (mode = 'move')}
	>
		<!-- Boot -->
		<svg viewBox="0 0 24 24">
			<path d="M8 3h5v8l5 3c1.5.8 2 2 2 3v2H5V3z" />
			<path d="M5 19h15" />
		</svg>
	</button>
	<button class="icon-button" title="Attack (coming soon)" aria-label="Attack" disabled>
		<!-- Sword -->
		<svg viewBox="0 0 24 24">
			<path d="M19 3l-9.5 9.5" />
			<path d="M19 3h-3l-8 8" />
			<path d="M19 3v3l-8 8" />
			<path d="M6.5 13.5l4 4" />
			<path d="M8.5 15.5L5 19" />
		</svg>
	</button>
</nav>
