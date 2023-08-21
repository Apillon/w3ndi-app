<template>
  <fieldset
    class="relative flex items-center w-full border-1 border-bg-light rounded-[20px] bg-bg-light mb-8 overflow-hidden"
  >
    <div
      v-for="option in options"
      :key="`${option.value}`"
      class="w-full rounded-[20px] overflow-hidden radio relative"
    >
      <input
        class="invisible absolute"
        type="radio"
        :name="name"
        :value="option.value"
        :id="name + '_' + option.value"
        :checked="modelValue === option.value"
        :disabled="option.disabled"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <label
        :for="name + '_' + option.value"
        class="relative block w-full pl-7 py-2 px-6 mb-0 body-md font-normal text-center text-body cursor-pointer z-1"
        :class="[labelClass]"
      >
        {{ option.label }}
      </label>
    </div>
    <div
      class="absolute top-0 bottom-0 rounded-[20px] bg-bg-dark transition-all"
      :style="radioSelectedStyle"
    ></div>

    <div class="absolute">
      <transition name="slide-fade">
        <Alert :value="error" />
      </transition>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
const props = defineProps({
  options: { type: Array<SelectOption>, default: [] },
  name: { type: String, required: true },
  labelClass: { type: [String, Array, Object], default: null },
  modelValue: { type: [String, Number], default: '' },
  error: { type: String, default: '' },
});
defineEmits(['update:modelValue']);

const selectedIndex = computed<number>(() => {
  return props.options.findIndex(item => item.value === props.modelValue);
});
const radioSelectedStyle = computed(() => {
  const numItems = props.options.length;
  const itemWidth = 100 / numItems;

  return {
    left: selectedIndex.value * itemWidth + '%',
    width: itemWidth + '%',
  };
});
</script>

<style lang="postcss" scoped>
input[type='radio'] {
  position: absolute;
  visibility: hidden;
  display: none;
}
input:disabled + label {
  opacity: 0.7;
  cursor: default;
}
input:not(:disabled) + label :hover {
  @apply text-white;
}

label {
  @apply relative w-full py-2 px-6 mb-0 cursor-pointer text-center text-body z-1;
}

input[type='radio']:checked + label {
  @apply text-white;
}
</style>
