<template>
  <Btn
    v-if="(state.account && state.account.address) || isWalletReady"
    v-bind="$attrs"
    type="secondary"
    class="bg-bg-dark !text-blue"
    @click="disconnectWallet"
  >
    Disconnect wallet
  </Btn>
  <Btn v-else v-bind="$attrs" type="secondary" @click="showModalWalletSelect">Connect wallet</Btn>

  <Modal :show="isWalletSelectVisible" title="Connect wallet">
    <WalletSelect @connect="onWalletConnected" :type="type" />
  </Modal>
</template>
<script lang="ts" setup>
import { useState } from '~/composables/useState';
import useWalletAccounts from '~/composables/useWalletAccounts';

defineProps({
  type: { type: Number, default: 0 },
});
const emit = defineEmits(['connect']);

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

function onWalletConnected(walletAddress: string) {
  isWalletSelectVisible.value = false;
  emit('connect', walletAddress);
}
</script>
