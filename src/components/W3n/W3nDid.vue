<template>
  <div class="relative w-full card-dark p-16 text-center max-w-[38rem] mx-auto">
    <h2 class="mb-2">Link your DID by KILT</h2>
    <p>
      Enter your DID by KILT via your Sporran wallet. <br />
      If you don’t have a DID yet, please create one on the link below.
    </p>
    <div class="actions mt-8 flex flex-col gap-8 justify-between">
      <Btn type="primary" @click="showModalSporran"> Connect Sporran wallet </Btn>
      <Btn type="secondary" class="bg-bg-dark" @click="showModalUploadDid"> Use Mnemonic </Btn>
    </div>
    <div class="mt-6">
      <Btn
        type="builders"
        class="bg-bg-dark"
        href="https://kilt-protocol.org/get-did/index.html"
        target="_blank"
      >
        I want to create a DID first
      </Btn>
    </div>

    <div class="absolute -left-2 lg:-left-4 xl:-left-8 top-1/2 -translate-x-full -translate-y-1/2">
      <button @click="emit('back')">
        <SvgInclude :name="SvgNames.Arrow" />
      </button>
    </div>
  </div>

  <Modal :show="isSporranConnectVisible" title="Choose sporran account">
    <WalletConnectSporran @back="isSporranConnectVisible = false" @proceed="emit('proceed')" />
  </Modal>

  <Modal :show="isUploadDidVisible" title="Connect wallet">
    <UploadDid @back="isUploadDidVisible = false" @proceed="emit('proceed')" />
  </Modal>
</template>

<script lang="ts" setup>
import { useState } from '~/composables/useState';
import { SvgNames } from '../Parts/SvgInclude.vue';

const emit = defineEmits(['proceed', 'back']);
const { resetState } = useState();

const isSporranConnectVisible = ref<boolean>(false);
const showModalSporran = () => {
  isSporranConnectVisible.value = false;
  setTimeout(async () => (isSporranConnectVisible.value = true), 1);
};

const isUploadDidVisible = ref<boolean>(false);
const showModalUploadDid = () => {
  isUploadDidVisible.value = false;
  setTimeout(() => (isUploadDidVisible.value = true), 1);
};

onMounted(() => {
  resetState();
});
</script>
