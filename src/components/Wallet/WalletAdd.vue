<template>
  <div class="transition-all">
    <div class="flex flex-col sm:flex-row sm:gap-8">
      <div class="field relative w-full mb-8 select">
        <label class="mr-2" for="chainType"> Chain </label>
        <Tooltip
          class="large"
          tooltipText="If you don't find your desired chain, you have the option to either contribute it to the Apillon GitHub repository under 'w3ndi-app', or you can reach out to us via email at info@apillon.io."
        >
          <svg-include :name="SvgNames.Info" class="w-4 h-4" />
        </Tooltip>
        <vue-select
          v-model="formWallet.chain"
          :options="chainList"
          label-by="label"
          track-by="name"
          searchable
          clear-on-select
          close-on-select
          id="chainType"
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

    <div
      class="flex gap-8 transition-all duration-300"
      :class="allowAdditionalChains ? 'max-h-20' : 'max-h-0 opacity-0 -z-1'"
    >
      <RadioButtons v-model="formWallet.inputType" :options="inputTypes" name="inputType" />
    </div>

    <!-- WALLET ADDRESS -->
    <div v-if="formWallet.inputType === 'address'" class="flex gap-8">
      <Input
        v-model="formWallet.address"
        id="walletAddress"
        class="w-full"
        label="Wallet address"
        placeholder="Type wallet address here"
      />
    </div>
    <div v-else class="flex gap-4">
      <WalletConnect
        class="w-auto whitespace-nowrap"
        :type="formWallet.chain.chainType"
        @connect="onWalletConnected"
      />
      <Select
        v-model="formWallet.address"
        :options="addresses"
        id="walletAddress"
        class="w-full"
        placeholder="Select wallet"
      />
    </div>

    <!-- MULTIPLE CHAINS -->
    <div
      class="flex flex-col gap-8 mb-8"
      :class="allowAdditionalChains ? 'max-h-60' : 'max-h-0 opacity-0 -z-1'"
    >
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

    <div class="flex flex-col sm:flex-row gap-4 sm:gap-8">
      <Btn type="secondary" @click="handleSubmit">Save and add another</Btn>
      <Btn type="primary" @click="save">Save</Btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import chains from '~/lib/data/chains.json';
import { useState } from '~/composables/useState';
import { useProvider } from '~/composables/useProvider';
import useWalletAccounts from '~/composables/useWalletAccounts';
import { toast } from 'vue3-toastify';
import { SvgNames } from '../Parts/SvgInclude.vue';

const emit = defineEmits(['close']);

const { state, setAccount, setAssetRecipients } = useState();
const { userAccount, walletProvider } = useProvider();
const { disconnectAccount } = useWalletAccounts();

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
  () => formWallet.chain,
  chain => {
    if (chain.chainType === ChainType.OTHER) {
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
  if (!formWallet.chain.caip19) {
    toast('Please select Chain', { type: 'error' });
    return false;
  } else if (!formWallet.tag) {
    toast('Please enter tag', { type: 'error' });
    return false;
  } else if (!formWallet.address) {
    toast('Please enter wallet address', { type: 'error' });
    return false;
  } else if (!validateAddress(formWallet.chain.caip19, formWallet.address)) {
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
  disconnectWallet();
  return true;
}

function onWalletConnected(walletAddress: string) {
  formWallet.address = walletAddress;
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

function disconnectWallet() {
  setAccount({} as WalletAccount);
  disconnectAccount();
}
</script>
