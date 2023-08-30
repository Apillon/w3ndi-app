<template>
  Lottie:
  <lottie-player
    src="/assets/apillon.lottie.json"
    background="#FFFFFF"
    speed="1"
    loop
    controls
    autoplay
    direction="1"
    mode="normal"
  >
  </lottie-player>
  Video:
  <video
    class="h-full w-full transform-gpu object-contain"
    :src="NovaWalletVideo"
    :autoplay="true"
    preload="auto"
    playsinline
    muted
    loop
  ></video>
</template>

<script lang="ts" setup>
import NovaWalletVideo from '~/assets/video/apillon test.webm';
useHead({
  script: [
    {
      src: 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js',
      type: 'text/javascript',
      async: true,
    },
  ],
});
</script>
