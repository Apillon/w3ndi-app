<template>
  <div>
    <div class="card-dark p-16 text-center max-w-xl">
      <h2 class="mb-2">Do you have a DID?</h2>
      <p>
        Please connect or upload ollis velit risus et est facilisis arcu feugiat dolor. Imperdiet
        proin sit nibh commodo. Nisi habitant nibh ultrices pellentesque. Brisus et est facilisis
        arcu feugiat dolor. Imperdiet proin sit nibh.
      </p>
      <div class="actions mt-8 flex gap-8 justify-between">
        <Btn type="blue" @click="showModalSporran"> Connect Sporran </Btn>
        <Btn type="secondary" class="bg-bg-dark" @click="showModalUploadDid"> Use Mnemonic </Btn>
      </div>
      <div class="mt-12">
        <h3>Don’t have a DID?</h3>
        <Btn type="builders" class="bg-bg-dark" @click="router.push('/registration')"
          >Create DID</Btn
        >
      </div>
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
const router = useRouter();
const emit = defineEmits(['proceed']);

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
</script>
