<template>
  <form @submit.prevent="handleSubmit">
    <div class="flex gap-8">
      <Select
        v-model="formWallet.chain"
        :options="chains"
        id="chainId"
        class="w-full"
        label="Chain"
        placeholder="Select chain"
      />
      <SelectInput
        v-model="formWallet.tag"
        :options="tags"
        id="walletTag"
        class="w-full"
        label="Tag"
        placeholder="Type text here"
      />
    </div>
    <div class="flex flex-gap-8">
      <SelectInput
        v-model="formWallet.address"
        :options="addresses"
        id="walletAddress"
        class="w-full"
        label="Address"
        placeholder="Type text here"
      />
    </div>
    <div class="flex gap-8">
      <Btn type="secondary" class="!text-red" locked @click="cancel">Cancel</Btn>
      <Btn type="primary" @click="handleSubmit">Save</Btn>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { Chains } from '~/types';
import { useState } from '~/composables/useState';
import { useProvider } from '~/composables/useProvider';

defineProps({
  actionText: { type: String, default: '' },
});
const emit = defineEmits(['cancel', 'success']);

const { state, setAssetRecipients } = useState();
const { userAccount, walletProvider } = useProvider();
import { toast } from 'vue3-toastify';

const formWallet = reactive({
  chain: '',
  tag: '',
  address: '',
});

const chains = ref([
  { label: 'Polkadot', value: Chains.POLKADOT },
  { label: 'Kilt', value: Chains.KILT },
  { label: 'Kusama', value: Chains.KUSAMA },
  { label: 'Ethereum', value: Chains.ETHEREUM },
]);

const tags = computed<Array<SelectOption>>(() => {
  if (userAccount.value) {
    return [
      {
        label: walletProvider.value,
        value: walletProvider.value,
      },
    ];
  }
  return state.accounts.map(account => {
    return {
      label: account.name as string,
      value: account.name as string,
    };
  });
});

const addresses = computed<Array<SelectOption>>(() => {
  if (userAccount.value) {
    return [
      {
        label: walletProvider.value,
        value: userAccount.value,
      },
    ];
  }
  return state.accounts.map(account => {
    return {
      label: account.name as string,
      value: account.address as string,
    };
  });
});

function cancel(e: Event | MouseEvent) {
  e.preventDefault();

  emit('cancel');
}

async function handleSubmit(e: Event | MouseEvent) {
  e.preventDefault();

  if (!validateAddress(formWallet.address, formWallet.chain)) {
    toast('Wallet address is invalid!', { type: 'error' });
    return;
  } else if (!formWallet.chain) {
    toast('Please select Chain', { type: 'error' });
    return;
  }

  const allAssetRecipients = pushRecipientToAccounts(
    state.assetRecipients,
    formWallet.chain,
    formWallet.address,
    { description: formWallet.tag }
  );
  toast('New account added to Asset recipient', { type: 'success' });
  setAssetRecipients(allAssetRecipients);
  resetForm();
  emit('success');
}

function pushRecipientToAccounts(
  accounts: KiltTransferAssetRecipientV2,
  chain: string,
  address: string,
  data: any
) {
  if (Object.keys(accounts).includes(chain)) {
    return {
      ...accounts,
      [chain]: {
        ...accounts[chain],
        [address]: data,
      },
    };
  } else {
    return {
      ...accounts,
      [chain]: { [address]: data },
    };
  }
}

function resetForm() {
  formWallet.chain = '';
  formWallet.tag = '';
  formWallet.address = '';
}
</script>
