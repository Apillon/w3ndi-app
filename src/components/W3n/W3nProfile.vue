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
        <small>w3n</small>
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
        <small>Kilt address</small>
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
          <h2>No wallet added.</h2>
          <p class="my-4">
            Morbi malesuada nulla lobortis commodo risus mattis eu. Metus proin nibh scelerisque ac.
            Est commodo in neque feugiat amet eget sed placerat. Urna quis.
          </p>
          <Btn class="w-auto" type="blue" @click="showModalAddNewWallet()">
            <span class="flex gap-2 items-center">
              <SvgInclude :name="SvgNames.Plus" />
              <span>Add new wallet</span>
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
                    <Tag
                      v-if="
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
                        class="p-1 text-white text-base"
                        @click="showModalEditWallet(chainCaip19, recipientAddress)"
                      >
                        <SvgInclude :name="SvgNames.Pencil" class="w-4 h-4" />
                      </button>
                      <button
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
        <div class="mt-8 flex justify-between">
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
            locked
            :loading="loading"
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

    <Modal :show="isAddNewWalletVisible" title="Add new wallet">
      <WalletAdd @close="isAddNewWalletVisible = false" />
    </Modal>
    <Modal :show="isEditWalletVisible" title="Edit wallet">
      <WalletEdit
        :chainCaip19="editedAccount.chainCaip19"
        :walletAddress="editedAccount.walletAddress"
        @close="isEditWalletVisible = false"
      />
    </Modal>
    <Modal :show="isModalDeployVisible" title="Deploy in progress">
      <Deploy :step="deployStep" :showRemoving="hasLoadedAssetRecipients" />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import {
  Blockchain,
  ConfigService,
  Did,
  DidResourceUri,
  KeyringPair,
  KiltAddress,
  connect,
  disconnect,
} from '@kiltprotocol/sdk-js';
import { ApiPromise } from '@polkadot/api';
import { toast } from 'vue3-toastify';

import { KILT_NETWORK } from '~/config';
import { DeployStep } from '~/types/index';
import { SvgNames } from '../SvgInclude.vue';
import { truncateWallet } from '~/lib/misc-utils';
import { chainIdToName } from '~/lib/kilt/w3n';
import { useDid } from '~/composables/useDid';
import { useState } from '~/composables/useState';
import { useSporran } from '~/composables/useSporran';

const emit = defineEmits(['back']);
const { sporranErrorMsg } = useSporran();
const { state, setAssetRecipients, removeAssetRecipient } = useState();
const {
  getDidDocument,
  openAccountOnBlockChain,
  prepareExistingServiceEndpointTx,
  prepareNewServiceEndpointTx,
  prepareServiceEndpointTXs,
} = useDid();

const loading = ref<boolean>(false);
const loadingAssetRecipients = ref<boolean>(false);
const isAddNewWalletVisible = ref<boolean>(false);
const isEditWalletVisible = ref<boolean>(false);
const isModalDeployVisible = ref<boolean>(false);
const loadedAssetRecipients = ref<KiltTransferAssetRecipientV2>({});
const account = ref<KeyringPair>();
let api: ApiPromise;

const deployStep = ref<number>(DeployStep.FILE_GENERATION);
const editedAccount = reactive({
  chainCaip19: '',
  walletAddress: '',
});

onMounted(async () => {
  await connect(KILT_NETWORK);
  api = ConfigService.get('api');
  parseAssetRecipients();

  if (state.mnemonic) {
    account.value = await generateAccount(state.mnemonic);
  }
});

onUnmounted(() => {
  disconnect();
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
const showModalDeploy = () => {
  isModalDeployVisible.value = false;
  deployStep.value = DeployStep.FILE_GENERATION;
  setTimeout(() => (isModalDeployVisible.value = true), 1);
};
const hideModalDeploy = () => {
  loading.value = false;
  isModalDeployVisible.value = false;
  deployStep.value = DeployStep.IDLE;
};

const parseAssetRecipients = async () => {
  loadedAssetRecipients.value = {};
  loadingAssetRecipients.value = true;

  if (state.didDocument?.service) {
    const service = state.didDocument.service.find(item =>
      item.type.includes(KILT_TRANSFER_ASSET_RECIPIENT_V2)
    );
    if (service && service.serviceEndpoint?.length) {
      service.serviceEndpoint.forEach(async item => {
        try {
          const response = await fetch(item, {
            method: 'GET',
            headers: APISettings.headers,
          });

          const data = await response.json();
          if (data) {
            loadedAssetRecipients.value = { ...loadedAssetRecipients.value, ...data };
            setAssetRecipients(loadedAssetRecipients.value);

            loadingAssetRecipients.value = false;
          }
        } catch (error) {
          console.log(error);
          toast('Error while fetching asset recipients, please refresh page.', { type: 'error' });
          loadingAssetRecipients.value = false;
        }
      });
    } else {
      loadingAssetRecipients.value = false;
    }
    setTimeout(() => (loadingAssetRecipients.value = false), 60000);
  } else {
    loadingAssetRecipients.value = false;
  }
};

function isExistingAddress(chainCaip19: string, walletAddress: string) {
  return (
    checkIfKeyExist(loadedAssetRecipients.value, chainCaip19) &&
    checkIfKeyExist(loadedAssetRecipients.value[chainCaip19], walletAddress)
  );
}

async function saveWallets() {
  if (!state.assetRecipients || Object.keys(state.assetRecipients).length === 0) {
    toast('You need to add at least one wallet.', { type: 'warning' });
    return;
  }
  loading.value = true;

  const hash = hashKiltTransferAssetRecipient(state.assetRecipients);
  const service = state.didDocument?.service?.find(item => item.id === `#${hash}`);
  if (service) {
    toast('Service with this ID already exists! Please make some changes.', { type: 'warning' });
    loading.value = false;
  } else {
    showModalDeploy();
    await uploadAccountsToIpfs();
  }
}

async function uploadAccountsToIpfs() {
  const { data, error }: any = await $api.post(`/w3n-assets`, {
    assets: state.assetRecipients,
  });

  if (error) {
    toast('Error during file upload, please try again later.', { type: 'error' });
    hideModalDeploy();
    return null;
  }
  deployStep.value = DeployStep.FILE_UPLOAD;

  return await getFile(data.data.fileUuid);
}

async function getFile(fileUuid: string) {
  const getFileInterval = setInterval(async () => {
    const fileData = await getFilePoll(fileUuid);

    if (fileData && fileData?.file?.CID) {
      clearInterval(getFileInterval);
      submitTransaction(fileData.file.CID);
    }
  }, 5000);
}

async function getFilePoll(fileUuid: string) {
  const { data, error } = await $api.get(`/w3n-assets/${fileUuid}`);

  if (data) {
    return data.data;
  }
  return null;
}

async function submitTransaction(fileCid: string) {
  try {
    if (window?.kilt?.sporran && state.sporranAccount.address) {
      await updateFullDidWithSporran(fileCid);
    } else {
      await updateFullDid(fileCid);
    }
  } catch (error) {
    console.warn(error);
    loading.value = false;
  }
}

async function updateFullDidWithSporran(fileCid: string) {
  /** Account from Sporran wallet */
  const account = state.sporranAccount;

  /** Sporran extension */
  const sporranExtension: SporranExtension<PubSubSession> = window.kilt.sporran;

  /** Existing "KiltTransferAssetRecipientV2" service Tx on didDocument */
  const existingServiceTx = prepareExistingServiceEndpointTx(api);

  if (existingServiceTx) {
    deployStep.value = DeployStep.CONF_REMOVE;
    const extrinsic = await sporranExtension.signExtrinsicWithDid(
      existingServiceTx.toJSON() as HexString,
      account.address as KiltAddress,
      state.didDocument.uri
    );

    /** Submit transaction with sporran wallet */
    await api
      .tx(extrinsic.signed)
      .signAndSend(account.address, { signer: account.signer }, ({ status }) => {
        if (status.isInBlock) {
          /** Create new service endpoint */
          createNewServiceEndpointWithSporran(fileCid);
        }
      })
      .catch((error: any) => {
        sporranErrorMsg(error);
        loading.value = false;
      });
  } else {
    createNewServiceEndpointWithSporran(fileCid);
  }
}

async function createNewServiceEndpointWithSporran(fileCid: string) {
  deployStep.value = DeployStep.CONF_SAVE;

  /** Account from Sporran wallet */
  const account = state.sporranAccount;

  /** Sporran extension */
  const sporranExtension: SporranExtension<PubSubSession> = window.kilt.sporran;

  /** Transaction with new service endpoint */
  const newServiceEndpointTx = prepareNewServiceEndpointTx(api, fileCid);

  /**
   * Sign extrinsic with DID
   */
  const { signed } = await sporranExtension.signExtrinsicWithDid(
    newServiceEndpointTx.toJSON() as HexString,
    account.address as KiltAddress,
    state.didDocument.uri
  );

  /** Submit transaction with sporran wallet */
  await api
    .tx(signed)
    .signAndSend(account.address, { signer: account.signer }, ({ status }) => {
      if (status.isInBlock) {
        loading.value = false;
        deployStep.value = DeployStep.COMPLETED;
      }
    })
    .catch((error: any) => {
      console.log('Transaction failed', error);
      sporranErrorMsg(error);
      loading.value = false;
    });

  refreshDidDocument();
  setTimeout(() => hideModalDeploy(), 1000);
}

async function updateFullDid(fileCid: string) {
  /** User's account */
  const account = await generateAccount(state.mnemonic);
  const { authentication } = await generateKeypairs(state.mnemonic);

  /** Existing "KiltTransferAssetRecipientV2" service on didDocument */
  const service = state.didDocument?.service?.find(item =>
    item.type.includes(KILT_TRANSFER_ASSET_RECIPIENT_V2)
  );

  /** Sign callback */
  const sign = async ({ data }: SignRequestData) => ({
    signature: authentication.sign(data, { withType: false }),
    keyUri: `${state.didDocument.uri}${state.didDocument.authentication[0].id}` as DidResourceUri,
    keyType: authentication.type,
  });

  // If user already has this service, update it with batch
  if (service) {
    deployStep.value = DeployStep.CONF_REMOVE;

    // and then the DID signature around it, which is
    const authorizedTx = await Did.authorizeBatch({
      batchFunction: api.tx.utility.batch,
      did: state.didDocument.uri,
      extrinsics: prepareServiceEndpointTXs(api, fileCid),
      sign: sign,
      submitter: account.address as KiltAddress,
    });
    deployStep.value = DeployStep.FILE_UPLOAD;

    // submit it with
    await Blockchain.signAndSubmitTx(authorizedTx, account);
  } else {
    deployStep.value = DeployStep.CONF_SAVE;

    // User doesn't have this service, create service "KiltTransferAssetRecipientV2"
    const authorizedTx = await Did.authorizeTx(
      state.didDocument.uri,
      prepareNewServiceEndpointTx(api, fileCid),
      sign,
      account.address as KiltAddress
    );

    // submit it with
    await Blockchain.signAndSubmitTx(authorizedTx, account);
  }

  refreshDidDocument();
  loading.value = false;
  deployStep.value = DeployStep.COMPLETED;
  setTimeout(() => hideModalDeploy(), 1000);
}

async function refreshDidDocument() {
  if (state.didDocument.uri) {
    getDidDocument(state.didDocument.uri);
  }
}
</script>
