<template>
  <div>
    <p class="mb-4">
      To finalize linking addresses to your web3name and deploy new address configuration, authorize
      and sign the transaction using Sporran wallet.
    </p>
    <ol class="body-md text-body">
      <li v-for="(item, key) in steps" class="flex gap-2 items-center my-4">
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
import { SvgNames } from '../Parts/SvgInclude.vue';

const props = defineProps({
  step: { type: Number, default: 0 },
  showRemoving: { type: Boolean, default: true },
});

const steps = ref([
  { id: DeployStep.FILE_GENERATION, text: 'Generating IPFS file' },
  { id: DeployStep.FILE_UPLOAD, text: 'Uploading to IPFS' },
]);

onMounted(() => {
  if (props.showRemoving) {
    steps.value.push({ id: DeployStep.CONF_REMOVE, text: 'Removing old configuration' });
  }
  steps.value.push({ id: DeployStep.CONF_SAVE, text: 'Saving web3name configuration' });
});
</script>
