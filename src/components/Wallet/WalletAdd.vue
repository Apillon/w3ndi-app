<template>
  <div>
    <div class="flex gap-8">
      <Select
        v-model="formWallet.chainType"
        :options="chainTypes"
        id="chainType"
        class="w-full"
        label="Chain type"
        placeholder="Select chain type"
      />
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
      <WalletConnect class="w-auto whitespace-nowrap" />
      <Select
        v-model="formWallet.address"
        :options="addresses"
        id="walletAddress"
        class="w-full"
        placeholder="Select wallet"
      />
    </div>

    <!-- MULTIPLE CHAINS -->
    <div class="flex flex-col gap-8 mb-8">
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
        <template v-if="formWallet.chainType && formWallet.chains[formWallet.chainType]">
          <Checkbox
            v-for="(chain, key) in additionalChains"
            v-model="formWallet.chains[formWallet.chainType][chain.label].selected"
            :id="'substrateChains_' + key"
            name="substrateChains"
            :disabled="key === 0"
            :labelHtml="chainLabelHtml(chain)"
          />
        </template>
      </div>
    </div>

    <div class="flex gap-8">
      <Btn type="secondary" @click="save">Save</Btn>
      <Btn type="primary" @click="handleSubmit">Save and add another</Btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useState } from '~/composables/useState';
import { useProvider } from '~/composables/useProvider';

defineProps({
  actionText: { type: String, default: '' },
});
const emit = defineEmits(['close']);

const { state, setAssetRecipients } = useState();
const { userAccount, walletProvider } = useProvider();
import { toast } from 'vue3-toastify';

const formWallet = reactive<FormWallet>({
  chainType: '',
  tag: '',
  inputType: 'address',
  address: '',
  multipleChains: false,
  chains: {
    [ChainsNamespaces.BITCOIN]: createSubChainsValues(ChainsNamespaces.BITCOIN),
    [ChainsNamespaces.COSMOS]: createSubChainsValues(ChainsNamespaces.COSMOS),
    [ChainsNamespaces.ETHEREUM]: createSubChainsValues(ChainsNamespaces.ETHEREUM),
    [ChainsNamespaces.POLKADOT]: createSubChainsValues(ChainsNamespaces.POLKADOT),
  },
});

function createSubChainsValues(chainType: string): Record<string, ChainDataRadio> {
  if (!checkIfKeyExist(CHAINS_DATA, chainType)) {
    return {};
  }
  const chains = Object.values(CHAINS_DATA[chainType]) as ChainData[];
  return chains.reduce((acc, item) => {
    acc[item.name] = {
      ...item,
      selected: Object.keys(acc).length === 0,
    };
    return acc;
  }, {} as Record<string, ChainDataRadio>);
}

const inputTypes = [
  {
    value: 'address',
    label: 'Type address',
  },
  {
    value: 'wallet',
    label: 'Connect wallet',
  },
];

const chainTypes = enumKeyValues(ChainsNamespaces).map(item => {
  return {
    label: item.key,
    value: item.value,
  } as SelectOption;
});

const additionalChains = computed<Array<SelectOption>>(() => {
  if (!checkIfKeyExist(CHAINS_DATA, formWallet.chainType)) {
    return [];
  }
  const chains = Object.values(CHAINS_DATA[formWallet.chainType]);
  return chains.map(item => {
    return {
      label: item.name,
      value: convertAddressForChain(formWallet.chainType, item.caip, formWallet.address),
    } as SelectOption;
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

async function save() {
  console.log(CHAINS_DATA);
  const walletAdded = await handleSubmit();
  console.log(walletAdded);
  if (walletAdded) {
    emit('close');
  }
}

async function handleSubmit() {
  if (!formWallet.chainType) {
    toast('Please select Chain', { type: 'error' });
    return false;
  } else if (!formWallet.tag) {
    toast('Please enter tag', { type: 'error' });
    return false;
  } else if (!formWallet.address) {
    toast('Please enter wallet address', { type: 'error' });
    return false;
  } else if (!validateAddress(formWallet.chainType, formWallet.address)) {
    toast('Wallet address is invalid!', { type: 'error' });
    return false;
  }
  const chains = Object.values(formWallet.chains[formWallet.chainType]);
  chains.forEach(chain => {
    if (chain.selected) {
      const address =
        additionalChains.value.find(item => item.label === chain.name)?.value || formWallet.address;

      const allAssetRecipients = pushRecipientToAccounts(
        state.assetRecipients,
        chain.caip,
        address.toString(),
        { description: formWallet.tag }
      );
      setAssetRecipients(allAssetRecipients);
    }
  });
  resetForm();
  return true;
}

function resetForm() {
  formWallet.chainType = '';
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
