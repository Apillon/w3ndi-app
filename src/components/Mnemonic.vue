<template>
  <div
    class="relative bg-bg-dark px-6 py-5 my-6 cursor-pointer"
    @click="e => copyToClipboard(phrases.join(' '), refCopy, e)"
  >
    <span ref="refCopy" class="hover w-max"></span>
    <ol class="columns-2 w-full">
      <li v-for="(phrase, key) in phrases" :key="key" class="py-1">
        <span class="mr-2">{{ keyToNumber(key) }}.</span>
        <strong>{{ phrase }}</strong>
      </li>
    </ol>
    <button class="absolute right-4 bottom-4">
      <Tooltip :tooltipText="'Click to copy to clipboard'">
        <svg-include :name="SvgNames.Copy" class="w-4 h-4" />
      </Tooltip>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { SvgNames } from './SvgInclude.vue';
import { copyToClipboard } from '~/lib/misc-utils';

defineProps({
  phrases: { type: Array<string>, default: [] },
});

const refCopy = ref<HTMLElement>();

function keyToNumber(key: number) {
  return (key + 1).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
}
</script>
