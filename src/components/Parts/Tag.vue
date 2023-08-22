<template>
  <strong
    v-bind="$attrs"
    class="inline-block py-1 px-3 rounded-xl text-[10px] leading-[14px] uppercase transition-all duration-300"
    :class="tagClass"
  >
    <slot />
  </strong>
</template>

<script lang="ts" setup>
const props = defineProps({
  type: {
    type: String,
    validator: (type: string) => ['default', 'success', 'info', 'warning', 'error'].includes(type),
    default: 'default',
  },
});

const tagClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'border-1 border-green text-green';
    case 'info':
      return 'bg-blue text-bg';
    case 'warning':
      return 'bg-warning text-bg';
    case 'error':
      return 'bg-pink text-bg';
    default:
      return 'border-1 border-body text-body';
  }
});
</script>
