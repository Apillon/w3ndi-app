<template>
  <div>
    <div ref="headerRef">
      <Header />
    </div>
    <div :class="$style.wrapperW3n" :style="contentMaxStyle">
      <div :class="$style.containerW3n" :style="contentMinStyle">
        <div :class="$style.innerW3n">
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

<style lang="postcss" module>
.wrapperW3n {
  @apply overflow-auto;
}
.containerW3n {
  @apply flex justify-center items-center;
}
.innerW3n {
  @apply relative py-10;
}
</style>
