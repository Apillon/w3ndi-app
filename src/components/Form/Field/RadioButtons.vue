<template>
  <fieldset class="radio-group relative">
    <div v-for="option in options" :key="`${option.value}`" class="field radio relative">
      <input
        class="invisible absolute"
        type="radio"
        :name="name"
        :value="option.value"
        :id="name + '_' + option.value"
        :checked="modelValue === option.value"
        :disabled="option.disabled"
        @change="$event => $emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <label
        :for="name + '_' + option.value"
        class="body-md block py-1 pl-7 font-normal text-left"
        :class="[labelClass]"
      >
        {{ option.label }}
      </label>
    </div>
    <div class="radio-selected" :style="radioSelectedStyle"></div>

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

const emit = defineEmits(['update:modelValue']);
watch(
  () => props.modelValue,
  val => {
    console.log(val);
  }
);

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
.radio-group {
  @apply flex items-center w-full border-1 border-bg-light rounded-[20px] bg-bg-light mb-8 overflow-hidden;
}

.radio-selected {
  @apply absolute top-0 bottom-0 rounded-[20px] bg-bg-dark transition-all;
}

.field {
  @apply w-full rounded-[20px] overflow-hidden;
}

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
