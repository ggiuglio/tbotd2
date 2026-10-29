<script lang="ts">
	let {
		sheetOpen = $bindable(),
		inventoryOpen = $bindable()
	}: { sheetOpen: boolean; inventoryOpen: boolean } = $props();
</script>

<nav class="paper flex w-16 flex-col items-center justify-around py-2">
	<button
		class="icon-button"
		class:selected={sheetOpen}
		title="Character sheet"
		aria-label="Character sheet"
		aria-pressed={sheetOpen}
		onclick={() => (sheetOpen = !sheetOpen)}
	>
		<!-- Scroll with a figure -->
		<svg viewBox="0 0 24 24">
			<path d="M6 3h10l2 2v16H6z" />
			<circle cx="12" cy="9" r="2.5" />
			<path d="M8 17c0-2.5 1.8-4 4-4s4 1.5 4 4" />
		</svg>
	</button>
	<button
		class="icon-button"
		class:selected={inventoryOpen}
		title="Inventory"
		aria-label="Inventory"
		aria-pressed={inventoryOpen}
		onclick={() => (inventoryOpen = !inventoryOpen)}
	>
		<!-- Backpack -->
		<svg viewBox="0 0 24 24">
			<path d="M9 6V4.5a3 3 0 0 1 6 0V6" />
			<path d="M5 10a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v10H5z" />
			<path d="M8 14h8v6H8z" />
		</svg>
	</button>
	<!-- Not implemented yet -->
	<button class="icon-button" title="Spellbook (coming soon)" aria-label="Spellbook" disabled>
		<!-- Book with a star -->
		<svg viewBox="0 0 24 24">
			<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" />
			<path d="M5 18a2 2 0 0 1 2-2h12" />
			<path d="M12 6.5l1 2.2 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3L8.7 9l2.3-.3z" />
		</svg>
	</button>
</nav>

