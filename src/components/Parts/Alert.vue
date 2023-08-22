<template>
  <p v-if="!hidden" v-bind="$attrs" :class="color">
    <template v-if="value"> {{ value }}</template>
    <template v-else><slot /></template>
  </p>
</template>

<script lang="ts" setup>
const props = defineProps({
  hidden: { type: Boolean, default: false },
  value: { type: String, default: '' },
  color: { type: String, default: 'text-green' },
});
const $slots = useSlots();
</script>
