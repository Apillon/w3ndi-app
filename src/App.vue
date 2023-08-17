<template>
  <div>
    <div ref="headerRef">
      <Header />
    </div>
    <div class="overflow-auto overflow-x-hidden overflow-y-auto" :style="contentMaxStyle">
      <div class="flex items-center max-w-7xl w-full px-8 mx-auto" :style="contentMinStyle">
        <div class="relative w-full py-10">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Buffer } from 'buffer';
import { $api } from '~/lib/api';
import { API_URL } from './config';

$api.setBaseUrl(API_URL);

window.Buffer = window.Buffer || Buffer;
window.kilt = {};
Object.defineProperty(window.kilt, 'meta', {
  value: {
    versions: {
      credentials: '3.0',
    },
  },
  enumerable: false,
});

/** Heading height */
const headerRef = ref<HTMLElement>();
const contentMinStyle = computed(() => {
  return {
    minHeight: `calc(100vh - ${headerRef.value?.clientHeight || 0}px)`,
  };
});
const contentMaxStyle = computed(() => {
  return {
    maxHeight: `calc(100vh - ${headerRef.value?.clientHeight || 0}px)`,
  };
});
</script>
