<script setup lang="ts">
import "@thorvg/lottie-player";
</script>

<template>
  <div className="app">
    <h1 className="app_title">ThorVG Vue Usage Example</h1>
    <lottie-player
      autoplay
      loop
      intermission="1000"
      mode="normal"
      src="https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json"
      style="width: 500px; height: 500px"
      wasmUrl="/thorvg.wasm"></lottie-player>
  </div>
</template>
