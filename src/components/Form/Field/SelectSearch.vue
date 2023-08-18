<template>
  <div class="field relative mb-8 select">
    <label v-if="label" :for="id" :class="labelClass">
      {{ label }}
    </label>
    <vue-select
      v-bind="$attrs"
      class="h-12 py-3 pl-4 pr-6 bg-bg-light border-1 border-bg-lighter"
      :class="[
        $style.select,
        {
          'pointer-events-none pointer-default opacity-60 color-bg-dark border-bg-lighter':
            props.disabled,
        },
      ]"
    ></vue-select>
    <div class="absolute">
      <transition name="slide-fade">
        <Alert :value="error" />
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  id: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  label: { type: [String, Number], default: '' },
  selectClass: { type: [String, Array, Object], default: null },
  labelClass: { type: [String, Array, Object], default: null },
});

defineEmits(['update:modelValue']);
</script>

<style lang="postcss" module>
.select {
  @apply w-full h-12 py-3 px-5 text-sm bg-bg-light border-1 border-bg-lighter rounded-lg transition-all duration-300 outline-none placeholder:text-body;

  &:not([multiple]) {
    outline: none; /* remove focus ring from Webkit */
    -webkit-appearance: none; /* remove the strong OSX influence from Webkit */
    background-position: right 50%;
    background-repeat: no-repeat;
    background-size: 20px;
    background-image: url('data:image/svg+xml;utf8,<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" version="1"><path fill="%23F0F2DA" d="M4 8L0 4h8z"/></svg>');
  }
  &:focus {
    @apply border-white;
  }
  &:hover {
    @apply border-body;
  }
}
</style>
<style lang="postcss"></style>
