<template>
  <div class="inline-block p-[6px] bg-orange/60 rounded-full">
    <svg :height="size" :width="size" viewBox="0 0 64 64">
      <circle
        v-for="(circle, key) in circles"
        :cx="circle.cx"
        :cy="circle.cy"
        :fill="circle.fill"
        :r="circle.r"
        :key="key"
      />
    </svg>
  </div>
</template>

<script lang="ts" setup>
import { polkadotIcon } from '@polkadot/ui-shared';
import { Circle } from '@polkadot/ui-shared/icons/types';

const props = defineProps({
  address: { type: String, default: '' },
  size: { type: Number, default: 72 },
});
const circles = ref<Circle[]>([]);

onMounted(() => {
  circles.value = polkadotIcon(props.address, { isAlternative: false });
});
</script>
