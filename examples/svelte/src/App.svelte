<script>
	import { onMount } from 'svelte';
	onMount(() => {
		import('@thorvg/lottie-player');
	});
</script>

<div class="app">
	<h1 class="app_title">ThorVG Svelte Usage Example</h1>
	<lottie-player
		autoPlay
		loop
		mode="normal"
		src="https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json"
		style="width: 500px; height: 500px;"
		wasmUrl="/thorvg.wasm"
	></lottie-player>
</div>
