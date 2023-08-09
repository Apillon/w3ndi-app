<template>
  <component
    :is="href ? 'a' : to ? 'router-link' : 'button'"
    v-bind="$attrs"
    :href="href || undefined"
    :to="to"
    :target="href ? '_blank' : ''"
    :class="btnClass"
    @click="onClick"
  >
    <Spinner v-if="loading" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
    <span class="inline-flex items-center" :class="{ 'opacity-0': loading }"> <slot /></span>
  </component>
</template>

<script lang="ts" setup>
const props = defineProps({
  href: { type: String, default: null },
  to: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  type: {
    type: String,
    validator: (value: string) =>
      ['primary', 'secondary', 'blue', 'builders', 'link'].includes(value),
    default: 'primary',
  },
  size: {
    type: String,
    validator: (value: string) => ['tiny', 'small', 'medium'].includes(value),
    default: 'medium',
  },
  onClick: { type: Function, default: null },
  hidden: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
});

const emit = defineEmits(['click']);

const $style = useCssModule();

/** Disable animation on load */
const isBtnLocked = ref<boolean>(!props.href && !props.to);
setTimeout(() => (isBtnLocked.value = false), 1000);

const btnClass = computed(() => {
  return [
    $style.btn,
    {
      'pointer-default': props.disabled || props.loading,
      'opacity-60': props.disabled,
      [$style.depressed]: props.loading,
      hidden: props.hidden,
      'h-10 px-5': props.size === 'small',
      'h-12 py-3 px-6': props.size === 'medium',
      'bg-primary text-bg rounded-lg': props.type === 'primary',
      'bg-bg text-primary border-1 border-bg-lighter': props.type === 'secondary',
      'hover-bounce': !props.href && !props.to && props.type !== 'builders',
      locked: isBtnLocked.value || props.locked,
      'inline-block w-auto h-auto p-0 bg-transparent text-sm text-yellow hover:bg-yellow hover:text-bg transition-all duration-300':
        props.type === 'builders',
      'bg-blue text-bg rounded-lg': props.type === 'blue',
      'h-auto p-0 text-yellow font-sans font-normal underline locked': props.type === 'link',
    },
  ];
});

function onClick(ev: MouseEvent) {
  if (props.loading || props.disabled) {
    ev.preventDefault();
    ev.stopPropagation();
  } else {
    emit('click', ev);
  }
}
</script>

<style lang="postcss" module>
.btn {
  @apply w-full relative inline-flex justify-center items-center p-2  font-bold cursor-pointer;
}

.depressed {
  opacity: 0.8;
}
</style>
