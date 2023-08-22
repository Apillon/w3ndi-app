<template>
  <span :tooltip="tooltipText" :position="position"><slot /></span>
</template>

<script lang="ts" setup>
defineProps({
  tooltipText: { type: String, default: '' },
  position: { type: String, default: 'top' },
});
</script>
