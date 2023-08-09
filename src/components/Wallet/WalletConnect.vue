<template>
  <Btn
    v-if="(state.account && state.account.address) || isWalletReady"
    type="secondary"
    class="bg-bg-dark !text-blue"
    @click="disconnectWallet"
    >Disconnect wallet</Btn
  >
  <Btn v-else type="blue" size="small" @click="showModalWalletSelect">Connect wallet</Btn>

  <Modal :show="isWalletSelectVisible" title="Connect wallet">
    <WalletSelect @connect="isWalletSelectVisible = false" />
  </Modal>
</template>
<script lang="ts" setup>
import { useState } from '~/composables/useState';
import useWalletAccounts from '~/composables/useWalletAccounts';

const { isReady: isWalletReady, disconnectAccount } = useWalletAccounts();
const { state, setAccount } = useState();

const isWalletSelectVisible = ref<boolean>(false);
const showModalWalletSelect = () => {
  isWalletSelectVisible.value = false;
  setTimeout(() => (isWalletSelectVisible.value = true), 1);
};

function disconnectWallet() {
  setAccount({} as WalletAccount);
  disconnectAccount();
}
</script>
