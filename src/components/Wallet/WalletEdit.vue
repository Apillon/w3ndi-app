<template>
  <div>
    <div class="flex gap-8">
      <Input
        v-model="formWallet.tag"
        id="walletTag"
        class="w-full"
        label="Tag"
        placeholder="Type text here"
        clearable
      />
    </div>

    <!-- WALLET ADDRESS -->
    <div class="flex gap-8">
      <Input
        v-model="formWallet.address"
        id="walletAddress"
        class="w-full"
        label="Wallet address"
        placeholder="Type wallet address here"
      />
    </div>

    <div class="flex gap-8">
      <Btn type="primary" @click="save">Save</Btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import chains from '~/lib/data/chains.json';
import { useState } from '~/composables/useState';
import { toast } from 'vue3-toastify';

const props = defineProps({
  chainCaip19: { type: String, required: true },
  walletAddress: { type: String, required: true },
});
const emit = defineEmits(['close']);

const { state, editAssetRecipient } = useState();

const formWallet = reactive({
  tag: '',
  address: '',
});

onMounted(() => {
  formWallet.address = props.walletAddress;

  if (
    checkIfKeyExist(state.assetRecipients, props.chainCaip19) &&
    checkIfKeyExist(state.assetRecipients[props.chainCaip19], props.walletAddress)
  ) {
    formWallet.tag = state.assetRecipients[props.chainCaip19][props.walletAddress]?.description;
  }
});

async function save() {
  if (!formWallet.tag) {
    toast('Please enter tag', { type: 'error' });
  } else if (!formWallet.address) {
    toast('Please enter wallet address', { type: 'error' });
  } else if (!validateAddress(props.chainCaip19, formWallet.address)) {
    toast('Wallet address is invalid!', { type: 'error' });
  } else {
    editAssetRecipient(props.chainCaip19, props.walletAddress, formWallet.address, {
      description: formWallet.tag,
    });
    emit('close');
  }
}
</script>
