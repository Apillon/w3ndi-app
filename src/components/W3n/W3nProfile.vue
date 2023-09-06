<template>
  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Profile -->
    <div class="card-dark p-4 sm:p-8 w-full lg:w-1/2 lg:max-w-xs">
      <div class="flex gap-8 justify-between">
        <h2 class="mb-8">My DID</h2>
        <Btn
          v-if="false"
          type="secondary"
          class="w-auto bg-bg-dark"
          @click="openAccountOnBlockChain(accountAddress)"
          locked
        >
          <span class="font-sans font-normal text-white">View on blockchain</span>
          <SvgInclude :name="SvgNames.Arrow" class="ml-2 text-white rotate-[135deg]" />
        </Btn>
      </div>
      <div class="mb-4">
        <Avatar v-if="accountAddress" :address="accountAddress" />
      </div>

      <!-- W3Name -->
      <p class="mb-4">
        <small>web3name</small>
        <span class="block overflow-x-auto">
          <strong class="text-white">w3n:{{ state.w3Name }}</strong>
        </span>
      </p>

      <!-- DID uri -->
      <p>
        <small>DID address</small>
        <span class="block overflow-x-auto scrollbar">
          <strong class="text-white text-xs">
            {{ state.didDocument.uri }}
          </strong>
        </span>
      </p>

      <!-- Validity -->
      <div v-if="false" class="flex gap-8 my-4">
        <p>
          <small>Created</small><br />
          <strong class="text-white">18.12.2023</strong>
        </p>
        <p>
          <small>Valid until</small><br />
          <strong class="text-white">18.12.2024</strong>
        </p>
      </div>

      <!-- Address -->
      <p v-if="accountAddress">
        <small>KILT address</small>
        <span class="block overflow-x-auto">
          <strong class="text-white text-xs">{{ accountAddress }}</strong>
        </span>
      </p>
    </div>

    <!-- Wallets -->
    <div class="card-dark p-4 sm:p-8 md:p-10 lg:p-16 w-full lg:flex-auto">
      <div v-if="loadingAssetRecipients" class="flex justify-center align-middle">
        <Spinner />
      </div>

      <div v-else-if="!hasLoadedAssetRecipients && !hasAssetRecipients">
        <div class="max-w-md p-8 mx-auto text-center">
          <h2>Add a new wallet address</h2>
          <p class="my-4">
            Add wallet addresses to w3ndi and start linking your digital addresses.
          </p>
          <Btn class="w-auto" type="blue" @click="showModalAddNewWallet()">
            <span class="flex gap-2 items-center">
              <SvgInclude :name="SvgNames.Plus" />
              <span>Add wallet address</span>
            </span>
          </Btn>
        </div>
      </div>

      <template v-else>
        <div class="flex gap-8 justify-between mb-8">
          <h2 class="mb-2">My wallets</h2>
        </div>
        <div class="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Chain</th>
                <th>Tag</th>
                <th>Address</th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody v-if="hasAssetRecipients">
              <template v-for="(recipients, chainCaip19) in state.assetRecipients" :key="chainId">
                <tr
                  v-for="(data, recipientAddress) in recipients"
                  :key="recipientAddress"
                  :class="{ 'text-white': isExistingAddress(chainCaip19, recipientAddress) }"
                >
                  <td>{{ chainIdToName(chainCaip19) }}</td>
                  <td>
                    <span v-if="data.description">
                      {{ data.description }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap">
                    <span class="xl:hidden">{{ truncateWallet(recipientAddress) }}</span>
                    <span class="hidden xl:inline-block">{{ recipientAddress }}</span>
                  </td>
                  <td>
                    <Tag v-if="data?.deleted" type="error"> Removed </Tag>
                    <Tag
                      v-else-if="
                        isTagChanged(chainCaip19, recipientAddress, data?.description) &&
                        deployStep !== DeployStep.COMPLETED
                      "
                      type="info"
                    >
                      Changed
                    </Tag>
                    <Tag
                      v-else-if="
                        isExistingAddress(chainCaip19, recipientAddress) ||
                        deployStep === DeployStep.COMPLETED
                      "
                      type="success"
                    >
                      Deployed
                    </Tag>
                    <Tag v-else type="warning">Undeployed</Tag>
                  </td>
                  <td>
                    <div class="flex gap-4">
                      <button
                        class="p-1 text-base"
                        :class="data?.deleted ? 'text-pink' : 'text-white'"
                        :disabled="data?.deleted"
                        @click="showModalEditWallet(chainCaip19, recipientAddress)"
                      >
                        <SvgInclude :name="SvgNames.Pencil" class="w-4 h-4" />
                      </button>
                      <button
                        v-if="data?.deleted"
                        class="p-1 text-pink text-base"
                        @click="unmarkDeletedAssetRecipient(chainCaip19, recipientAddress)"
                      >
                        <SvgInclude :name="SvgNames.Trash" class="w-4 h-4" />
                      </button>
                      <button
                        v-else-if="isExistingAddress(chainCaip19, recipientAddress)"
                        class="p-1 text-white text-base"
                        @click="markDeletedAssetRecipient(chainCaip19, recipientAddress)"
                      >
                        <SvgInclude :name="SvgNames.Trash" class="w-4 h-4" />
                      </button>
                      <button
                        v-else
                        class="p-1 text-white text-base"
                        @click="removeAssetRecipient(chainCaip19, recipientAddress)"
                      >
                        <SvgInclude :name="SvgNames.Trash" class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
            <tbody v-else>
              <div class="p-3">You removed all accounts, please add some</div>
            </tbody>
          </table>
        </div>
        <div class="mt-8 flex gap-4 flex-col sm:flex-row justify-between">
          <Btn
            type="secondary"
            class="w-auto text-yellow bg-bg-dark"
            locked
            @click="showModalAddNewWallet"
          >
            <SvgInclude :name="SvgNames.Plus" class="mr-2" />
            <span class="font-sans font-normal">Add new wallet</span>
          </Btn>

          <Btn
            v-if="hasAssetRecipients"
            type="primary"
            class="w-auto bg-bg-dark"
            :class="{ 'cursor-default': !hasUserChangeAssetRecipients }"
            locked
            :loading="loading"
            :disabled="!hasUserChangeAssetRecipients"
            @click="saveWallets()"
          >
            <span class="font-sans">Save and deploy</span>
          </Btn>
        </div>
      </template>
    </div>

    <div class="absolute -left-1 lg:-left-2 xl:-left-4 top-1/2 -translate-x-full -translate-y-1/2">
      <button @click="emit('back')">
        <SvgInclude :name="SvgNames.Arrow" />
      </button>
    </div>

    <Modal :show="isAddNewWalletVisible" title="Add new wallet address">
      <WalletAdd @close="isAddNewWalletVisible = false" />
    </Modal>
    <Modal :show="isEditWalletVisible" title="Edit wallet">
      <WalletEdit
        :chainCaip19="editedAccount.chainCaip19"
        :walletAddress="editedAccount.walletAddress"
        @close="isEditWalletVisible = false"
      />
    </Modal>
    <Modal :show="isModalDeployVisible" title="Deployment in progress">
      <Deploy :step="deployStep" :showRemoving="hasLoadedAssetRecipients" />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { KeyringPair } from '@kiltprotocol/sdk-js';

import { truncateWallet } from '~/lib/misc-utils';
import { chainIdToName } from '~/lib/kilt/w3n';
import { DeployStep } from '~/types/index';
import { useDid } from '~/composables/useDid';
import { useState } from '~/composables/useState';
import useBlockchain from '~/composables/useBlockchain';
import { SvgNames } from '../Parts/SvgInclude.vue';

const emit = defineEmits(['back']);
const {
  state,
  markDeletedAssetRecipient,
  unmarkDeletedAssetRecipient,
  removeAssetRecipient,
  resetAssetRecipients,
} = useState();
const { openAccountOnBlockChain } = useDid();
const {
  deployStep,
  loading,
  loadingAssetRecipients,
  isModalDeployVisible,
  loadedAssetRecipients,
  parseAssetRecipients,
  isExistingAddress,
  isTagChanged,
  saveWallets,
} = useBlockchain();

const isAddNewWalletVisible = ref<boolean>(false);
const isEditWalletVisible = ref<boolean>(false);
const account = ref<KeyringPair>();

const editedAccount = reactive({
  chainCaip19: '',
  walletAddress: '',
});

onMounted(async () => {
  resetAssetRecipients();
  parseAssetRecipients();

  if (state.mnemonic) {
    account.value = await generateAccount(state.mnemonic);
  }
});

const accountAddress = computed<string>(() => {
  return account.value?.address || state.sporranAccount.address;
});
const hasLoadedAssetRecipients = computed<boolean>(() => {
  return loadedAssetRecipients.value && Object.keys(loadedAssetRecipients.value).length > 0;
});
const hasAssetRecipients = computed<boolean>(() => {
  return state.assetRecipients && Object.keys(state.assetRecipients).length > 0;
});
const hasUserChangeAssetRecipients = computed<boolean>(() => {
  const hash = hashKiltTransferAssetRecipient(state.assetRecipients);
  const service = state.didDocument?.service?.find(item => item.id === `#${hash}`);
  return !service;
});

const showModalAddNewWallet = () => {
  isAddNewWalletVisible.value = false;
  setTimeout(() => (isAddNewWalletVisible.value = true), 1);
};
const showModalEditWallet = (chainCaip19: string, walletAddress: string) => {
  editedAccount.chainCaip19 = chainCaip19;
  editedAccount.walletAddress = walletAddress;

  isEditWalletVisible.value = false;
  setTimeout(() => (isEditWalletVisible.value = true), 1);
};
</script>
