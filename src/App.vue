<template>
  <router-view />
</template>

<script setup>
import { $api } from '~/lib/api';

const CONFIG = import.meta.env;
$api.setBaseUrl(CONFIG.VITE_API_URL);

window.kilt = {};
Object.defineProperty(window.kilt, 'meta', {
  value: {
    versions: {
      credentials: '3.0',
    },
  },
  enumerable: false,
});

</script>