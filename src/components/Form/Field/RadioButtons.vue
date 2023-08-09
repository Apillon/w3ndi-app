<template>
  <fieldset class="radio-group">
    <div v-for="option in options" :key="`${option.value}`" class="field radio relative mb-7">
      <input
        :checked="modelValue === option.value"
        type="radio"
        :name="name"
        :id="name + '_' + option.value"
        class="invisible absolute"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <label
        :for="name + '_' + option.value"
        class="body-md block py-1 pl-7 font-normal text-left"
        :class="[labelClass]"
      >
        {{ option.label }}
      </label>
    </div>
    <div class="absolute">
      <transition name="slide-fade">
        <Alert :value="error" />
      </transition>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
defineProps({
  options: { type: Array<SelectOption>, default: [] },
  name: { type: String, required: true },
  labelClass: { type: [String, Array, Object], default: null },
  modelValue: { type: [String, Number], default: '' },
  error: { type: String, default: '' },
});

const emit = defineEmits(['change:modelValue']);
</script>

<style lang="postcss" scoped>
label {
  @apply relative flex w-full cursor-pointer items-center;
  line-height: 1.2;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: calc(50% - 10px);
    display: block;
    width: 18px;
    height: 18px;
    border: 2px solid theme('colors.bodyDark');
  }
  &:hover:before {
    border-color: theme('colors.white');
  }
}

input:checked + label:before {
  border-color: theme('colors.white');
  background-color: theme('colors.white');
}
input:checked + label:after {
  content: '';
  position: absolute;
  top: calc(50% - 9px);
  left: 1px;
  display: block;
  width: 16px;
  height: 16px;
  color: theme('colors.bg.DEFAULT');
  background-image: url("data:image/svg+xml, %3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.99999 15.172L19.192 5.979L20.607 7.393L9.99999 18L3.63599 11.636L5.04999 10.222L9.99999 15.172Z' fill='currentColor' stroke='currentColor' stroke-width='1'/%3E%3C/svg%3E");
}

input:disabled + label {
  opacity: 0.7;
  cursor: default;
}
</style>
