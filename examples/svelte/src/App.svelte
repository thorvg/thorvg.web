<script lang="ts">
	import { onMount } from 'svelte';
	import playerWasmUrl from '../node_modules/@thorvg/lottie-player/dist/thorvg.wasm?url';
	import wcanvasWasmUrl from '../node_modules/@thorvg/webcanvas/dist/thorvg.wasm?url';

	let error: string | null = null;
	let initialized = false;

	onMount(async () => {
		// Import lottie-player
		import('@thorvg/lottie-player');

		// Import and initialize webcanvas
		try {
			const ThorVG = await import('@thorvg/webcanvas');

			const TVG = await ThorVG.default.init({
				renderer: 'gl',
				locateFile: (path) => {
					const filename = path.split('/').pop();
					return wcanvasWasmUrl.replace('thorvg.wasm', filename || '');
				}
			});

			// Create canvas using CSS selector
			const canvas = new TVG.Canvas('#webcanvas', {
				width: 800,
				height: 600
			});

			// Red rounded rectangle
			const rect = new TVG.Shape();
			rect.appendRect(100, 100, 200, 150, { rx: 10, ry: 10 });
			rect.fill(255, 0, 0, 255);

			// Blue circle with black stroke
			const circle = new TVG.Shape();
			circle.appendCircle(500, 200, 80, 80);
			circle.fill(0, 100, 255, 255);
			circle.stroke({ width: 5, color: [0, 0, 0, 255] });

			canvas.add(rect).add(circle).render();
			initialized = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to initialize WebCanvas';
			console.error('WebCanvas initialization error:', err);
		}
	});
</script>

<div class="app">
	<h1 class="app_title">ThorVG Svelte Usage Example</h1>

	<!-- Example lottie-player -->
	<section class="example-section">
		<h2>Lottie Player Example</h2>
		<lottie-player
			autoPlay
			loop
			mode="normal"
			src="https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json"
			style="width: 500px; height: 500px;"
			wasmUrl={playerWasmUrl}
		></lottie-player>
	</section>

	<!-- Example webcanvas -->
	<section class="example-section">
		<h2>WebCanvas Example</h2>
		{#if error}
			<p class="error">Error: {error}</p>
		{/if}
		{#if initialized}
			<p class="success">WebCanvas initialized successfully!</p>
		{/if}
		<canvas
			id="webcanvas"
			width="800"
			height="600"
			class="webcanvas"
		></canvas>
	</section>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.app_title {
		font-size: 2.5rem;
		margin-bottom: 2rem;
		color: #ff3e00;
	}

	.example-section {
		margin: 2rem 0;
		text-align: center;
	}

	.example-section h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #ff3e00;
	}

	.webcanvas {
		border: 1px solid #ff3e00;
		background: white;
		margin: 1rem 0;
	}

	.error {
		color: #ff6b6b;
		font-weight: bold;
	}

	.success {
		color: #51cf66;
		font-weight: bold;
	}
</style>
