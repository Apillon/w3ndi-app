<template>
  <div>
    <p class="mb-4">
      Deploy in progress To save your w3n address, use Sporran wallet for signing. Sporran wallet
      will now initialize and you need to sign the transaction to deploy the new address
      configuration.
    </p>
    <ol class="body-md text-body">
      <li
        v-for="(item, key) in steps"
        class="flex gap-2 items-center my-4"
        :class="[{ hidden: item?.hide }, { 'text-white': item.id <= step }]"
      >
        <SvgInclude v-if="item.id < step" :name="SvgNames.Success" class="w-5 h-5 text-green" />
        <Typing v-else-if="item.id === step" />
        <strong
          v-else
          class="w-5 h-5 flex justify-center items-center text-xs text-bg bg-body rounded-full"
        >
          {{ key + 1 }}
        </strong>

        <span>{{ item.text }}</span>
      </li>
    </ol>
  </div>
</template>

<script lang="ts" setup>
import { SvgNames } from '../SvgInclude.vue';

const props = defineProps({
  step: { type: Number, default: 0 },
  showRemoving: { type: Boolean, default: true },
});

const steps = ref([
  { id: DeployStep.FILE_GENERATION, text: 'Generating IPFS file' },
  { id: DeployStep.FILE_UPLOAD, text: 'Uploading to IPFS' },
  { id: DeployStep.CONF_REMOVE, text: 'Removing old configuration', hide: !props.showRemoving },
  { id: DeployStep.CONF_SAVE, text: 'Saving new configuration' },
]);
</script>
