<template>
  <div class="field relative mb-7" :class="type">
    <label v-if="label" :for="id" :class="labelClass">
      {{ label }}
    </label>
    <input
      v-bind="$attrs"
      :id="id"
      :list="`${id}_list`"
      :name="id"
      :value="modelValue"
      :type="type"
      :disabled="disabled"
      :placeholder="placeholder"
      :class="[inputClass, { empty: isFieldEmpty, '!border-pink !text-pink': error }]"
      @input="$event => $emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <datalist :id="`${id}_list`">
      <option v-for="option in options" :value="option.value">{{ option.label }}</option>
    </datalist>
    <div class="absolute">
      <transition name="slide-fade">
        <Alert :value="error" />
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  type: {
    type: String,
    default: 'text',
    validator: (type: string) =>
      ['text', 'email', 'hidden', 'password', 'search', 'number', 'tel', 'url'].includes(type),
  },
  id: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  label: { type: [String, Number], default: '' },
  inputClass: { type: [String, Array, Object], default: null },
  labelClass: { type: [String, Array, Object], default: null },
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array<SelectOption>, default: [] },
});

const emit = defineEmits(['update:modelValue']);
const $style = useCssModule();

const inputClass = computed(() => {
  return [
    $style.input,
    {
      'pointer-events-none pointer-default opacity-60 color-bg-dark border-bg-lighter':
        props.disabled,
    },
  ];
});

const isFieldEmpty = computed(() => {
  return !(props.modelValue && props.modelValue.toString().length > 0);
});
</script>

<style lang="postcss" module>
.input {
  @apply w-full h-12 py-3 px-5 text-sm bg-bg-light border-1 border-bg-lighter rounded-none transition-all duration-300 outline-none placeholder:text-body;

  &:focus {
    @apply border-white;
  }
  &:hover {
    @apply border-body;
  }
}
</style>
