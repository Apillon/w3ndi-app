<template>
  <div>
    <div class="flex gap-8">
      <div class="field relative mb-8 select">
        <label for="chainType"> Chain </label>
        <vue-select
          v-model="formWallet.chain"
          :options="chainList"
          label-by="label"
          id="chainType"
          class="h-12 py-3 pl-4 pr-6 bg-bg-light border-1 border-bg-lighter"
          placeholder="Select chain type"
        ></vue-select>
      </div>
      <Input
        v-model="formWallet.tag"
        id="walletTag"
        class="w-full"
        label="Tag"
        placeholder="Type text here"
        clearable
      />
    </div>

    <div class="flex gap-8">
      <RadioButtons v-model="formWallet.inputType" :options="inputTypes" name="inputType" />
    </div>

    <!-- WALLET ADDRESS -->
    <div v-if="formWallet.inputType === 'address'" class="flex gap-8">
      <Input
        v-model="formWallet.address"
        id="walletAddress"
        class="w-full"
        placeholder="Type wallet address here"
      />
    </div>
    <div v-else class="flex gap-4">
      <WalletConnect class="w-auto whitespace-nowrap" :type="formWallet.chain.chainType" />
      <Select
        v-model="formWallet.address"
        :options="addresses"
        id="walletAddress"
        class="w-full"
        placeholder="Select wallet"
      />
    </div>

    <!-- MULTIPLE CHAINS -->
    <div v-if="allowAdditionalChains" class="flex flex-col gap-8 mb-8">
      <Checkbox
        v-model="formWallet.multipleChains"
        id="multipleChains"
        name="multipleChains"
        label="I want to use this address on multiple chains"
      />
      <div
        v-if="formWallet.multipleChains"
        class="flex flex-col gap-4 py-3 px-5 max-h-52 card-border rounded-lg overflow-auto"
      >
        <Checkbox
          v-for="(chain, key) in additionalChains"
          v-model="chain.selected"
          :id="'substrateChains_' + key"
          name="substrateChains"
          :disabled="chain.disabled"
          :labelHtml="chainLabelHtml(chain)"
        />
      </div>
    </div>

    <div class="flex gap-8">
      <Btn type="secondary" @click="save">Save</Btn>
      <Btn type="primary" @click="handleSubmit">Save and add another</Btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import chains from '~/lib/data/chains.json';
import { useState } from '~/composables/useState';
import { useProvider } from '~/composables/useProvider';
import { toast } from 'vue3-toastify';

const emit = defineEmits(['close']);

const { state, setAssetRecipients } = useState();
const { userAccount, walletProvider } = useProvider();

const formWallet = reactive<FormWallet>({
  chain: {} as ChainOption,
  tag: '',
  inputType: 'address',
  address: '',
  multipleChains: false,
});

const chainList: ChainOption[] = chains.map(item => {
  return {
    ...item,
    label: item.name,
    value: item.caip19,
  };
});

const inputTypes = computed(() => {
  return [
    {
      value: 'address',
      label: 'Type address',
      disabled: false,
    },
    {
      value: 'wallet',
      label: 'Connect wallet',
      disabled: !allowAdditionalChains.value,
    },
  ];
});

const allowAdditionalChains = computed<boolean>(() => {
  return (
    formWallet.chain?.chainType === ChainType.EVM ||
    formWallet.chain?.chainType === ChainType.SUBSTRATE
  );
});

const additionalChains = computed<Array<ChainOption>>(() => {
  const chainType = formWallet.chain?.chainType || ChainType.OTHER;
  return chains
    .filter(chain => chain.chainType === chainType)
    .map(item => {
      return {
        ...item,
        label: item.name,
        value: convertAddressForChain(chainType, formWallet.address, item.ss58Prefix),
        selected: item.caip19 === formWallet.chain.value,
        disabled: item.caip19 === formWallet.chain.value,
      } as ChainOption;
    });
});

const addresses = computed<Array<SelectOption>>(() => {
  if (userAccount.value) {
    return [
      {
        label: walletProvider.value + ': ' + userAccount.value,
        value: userAccount.value,
      },
    ];
  }
  return state.accounts.map(account => {
    return {
      label: account.name + ': ' + account.address,
      value: account.address as string,
    };
  });
});

watch(
  () => formWallet.chain.chainType,
  chainType => {
    if (chainType === ChainType.OTHER) {
      formWallet.inputType = 'address';
    }
  }
);

async function save() {
  const walletAdded = await handleSubmit();
  if (walletAdded) {
    emit('close');
  }
}

async function handleSubmit() {
  if (!formWallet.chain.chainType) {
    toast('Please select Chain', { type: 'error' });
    return false;
  } else if (!formWallet.tag) {
    toast('Please enter tag', { type: 'error' });
    return false;
  } else if (!formWallet.address) {
    toast('Please enter wallet address', { type: 'error' });
    return false;
  } else if (!validateAddress(formWallet.chain.chainType, formWallet.address)) {
    toast('Wallet address is invalid!', { type: 'error' });
    return false;
  }

  const allAssetRecipients = pushRecipientToAccounts(
    state.assetRecipients,
    formWallet.chain.caip19,
    convertAddressForChain(
      formWallet.chain.chainType,
      formWallet.address,
      formWallet.chain.ss58Prefix
    ),
    { description: formWallet.tag }
  );
  setAssetRecipients(allAssetRecipients);

  additionalChains.value.forEach(chain => {
    if (chain.selected) {
      const allAssetRecipients = pushRecipientToAccounts(
        state.assetRecipients,
        chain.caip19,
        chain.value.toString(),
        { description: formWallet.tag }
      );
      setAssetRecipients(allAssetRecipients);
    }
  });
  resetForm();
  return true;
}

function resetForm() {
  formWallet.chain = {} as ChainOption;
  formWallet.tag = '';
  formWallet.address = '';
  formWallet.multipleChains = false;
}

function chainLabelHtml(chain: SelectOption) {
  return `
    <div class="flex gap-4 justify-between">
      <strong>${chain.label}</strong>
      <span class="text-body text-xs">${chain.value}</span>
    </div>
  `;
}
</script>
