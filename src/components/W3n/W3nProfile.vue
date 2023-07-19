<template>
  <div class="max-w-7xl w-screen px-8 py-4 mx-auto flex gap-8">
    <!-- Profile -->
    <div class="card-dark p-16 w-1/2">
      <div class="flex gap-8 justify-between">
        <h2 class="mb-2">My DID</h2>
        <Btn
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
        <small>w3n</small><br />
        <strong class="text-white">{{ state.w3Name }}</strong>
      </p>

      <!-- DID uri -->
      <p>
        <small>Identity address</small><br />
        <strong class="text-white">
          {{ state.didDocument.uri }}
        </strong>
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
        <small>Kilt address</small><br />
        <strong class="text-white">{{ accountAddress }}</strong>
      </p>
    </div>

    <!-- Wallets -->
    <div class="card-dark p-16 w-1/2">
      <div class="flex gap-8 justify-between mb-8">
        <h2 class="mb-2">My wallets</h2>

        <!-- Edit Wallets -->
        <Btn
          v-if="editWallets"
          type="secondary"
          class="w-auto !text-green bg-bg-dark"
          locked
          :loading="loading"
          @click="saveWallets()"
        >
          <span class="font-sans font-normal">Save and deploy</span>
          <SvgInclude :name="SvgNames.Success" class="ml-2" />
        </Btn>
        <Btn
          v-else
          type="secondary"
          class="w-auto text-yellow bg-bg-dark"
          locked
          @click="editWallets = true"
        >
          <span class="font-sans font-normal">Edit wallets</span>
          <SvgInclude :name="SvgNames.Pencil" class="ml-2" />
        </Btn>
      </div>

      <div v-if="loadingAssetRecipients" class="flex justify-center align-middle">
        <Spinner />
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>Chain</th>
            <th>Properties</th>
            <th>Address</th>
            <th />
          </tr>
        </thead>
        <tbody v-if="state.assetRecipients && Object.keys(state.assetRecipients).length">
          <template v-for="(recipients, chainId) in state.assetRecipients" :key="chainId">
            <tr v-for="(data, recipientAddress) in recipients" :key="recipientAddress">
              <td>{{ chainIdToName(chainId) }}</td>
              <td>
                <ul>
                  <li v-for="(dataItem, dataId) in data" :key="dataId">
                    <strong>{{ dataId }}:</strong>
                    {{ dataItem }}
                  </li>
                </ul>
              </td>
              <td class="whitespace-nowrap">
                {{ truncateWallet(recipientAddress) }}
              </td>
              <td>
                <button
                  v-if="editWallets"
                  class="p-1 text-white text-base"
                  @click="removeAssetRecipients(chainId, recipientAddress)"
                >
                  <SvgInclude :name="SvgNames.Trash" class="w-4 h-4" />
                </button>
                <div v-else class="w-6 h-6"></div>
              </td>
            </tr>
          </template>
        </tbody>
        <tbody
          v-else-if="!loadedAssetRecipients || Object.keys(loadedAssetRecipients).length === 0"
        >
          <div class="p-3">You don't have any accounts yet</div>
        </tbody>
        <tbody v-else>
          <div class="p-3">You removed all accounts, please add some</div>
        </tbody>
      </table>

      <div class="mt-8">
        <Btn
          v-if="editWallets"
          type="secondary"
          class="w-auto text-yellow bg-bg-dark"
          locked
          @click="showModalAddNewWallet"
        >
          <SvgInclude :name="SvgNames.Plus" class="mr-2" />
          <span class="font-sans font-normal">Add new wallet</span>
        </Btn>
      </div>
    </div>
    <div class="absolute left-0 top-1/2 -translate-y-1/2">
      <button @click="emit('back')">
        <SvgInclude :name="SvgNames.Arrow" />
      </button>
    </div>

    <Modal :show="isAddNewWalletVisible" title="Add new wallet">
      <WalletAdd @cancel="isAddNewWalletVisible = false" />
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
import { SvgNames } from '../SvgInclude.vue';
import { truncateWallet } from '~/lib/misc-utils';
import { chainIdToName } from '~/lib/kilt/w3n';
import { useDid } from '~/composables/useDid';
import { useState } from '~/composables/useState';
import { useSporran } from '~/composables/useSporran';

const emit = defineEmits(['back']);
const { sporranErrorMsg } = useSporran();
const { state, setAssetRecipients, removeAssetRecipients } = useState();
const {
  getDidDocument,
  openAccountOnBlockChain,
  prepareExistingServiceEndpointTx,
  prepareNewServiceEndpointTx,
  prepareServiceEndpointTXs,
} = useDid();

const loading = ref<boolean>(false);
const loadingAssetRecipients = ref<boolean>(false);
const editWallets = ref<boolean>(false);
const isAddNewWalletVisible = ref<boolean>(false);
const loadedAssetRecipients = ref<KiltTransferAssetRecipientV2>({});
const account = ref<KeyringPair>();
let api: ApiPromise;

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

const showModalAddNewWallet = () => {
  isAddNewWalletVisible.value = false;
  setTimeout(() => (isAddNewWalletVisible.value = true), 1);
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
  } else {
    await uploadAccountsToIpfs();
  }
}

async function uploadAccountsToIpfs() {
  const { data, error }: any = await $api.post(`/w3n-assets`, {
    assets: state.assetRecipients,
  });

  if (error) {
    toast('Error during file upload, please try again later.', { type: 'error' });
    loading.value = false;
    return null;
  }
  toast('File successfully created and is uploading to IPFS', {
    type: 'success',
    autoClose: 20000,
  });

  return await getFile(data.data.fileUuid);
}

async function getFile(fileUuid: string) {
  const getFileInterval = setInterval(async () => {
    const fileData = await getFilePoll(fileUuid);

    if (fileData && fileData?.file?.CID) {
      clearInterval(getFileInterval);

      toast('File successfully uploaded to IPFS', { type: 'success' });
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
  console.log(existingServiceTx?.toHuman());

  if (existingServiceTx) {
    const extrinsic = await sporranExtension.signExtrinsicWithDid(
      existingServiceTx.toJSON() as HexString,
      account.address as KiltAddress,
      state.didDocument.uri
    );

    /** Submit transaction with sporran wallet */
    await api
      .tx(extrinsic.signed)
      .signAndSend(account.address, { signer: account.signer }, ({ status }) => {
        console.log(status);
        if (status.isBroadcast) {
          toast('Deleting old service endpoint', {
            type: 'info',
            autoClose: 15000,
          });
        } else if (status.isInBlock) {
          toast('Old service is successfully removed', { type: 'success' });

          /** Create new service endpoint */
          createNewServiceEndpointWithSporran(fileCid);
        }
      })
      .catch((error: any) => {
        console.log('Transaction failed', error);
        sporranErrorMsg(error);
        loading.value = false;
      });
  } else {
    createNewServiceEndpointWithSporran(fileCid);
  }
}

async function createNewServiceEndpointWithSporran(fileCid: string) {
  /** Account from Sporran wallet */
  const account = state.sporranAccount;

  /** Sporran extension */
  const sporranExtension: SporranExtension<PubSubSession> = window.kilt.sporran;

  /** Transaction with new service endpoint */
  const newServiceEndpointTx = prepareNewServiceEndpointTx(api, fileCid);
  console.log(newServiceEndpointTx.toHuman());

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
      if (status.isBroadcast) {
        toast('Creating new service endpoint', {
          type: 'info',
          autoClose: 15000,
        });
      } else if (status.isInBlock) {
        toast('New service is successfully added to DID', { type: 'success' });
        loading.value = false;
      }
    })
    .catch((error: any) => {
      console.log('Transaction failed', error);
      sporranErrorMsg(error);
      loading.value = false;
    });

  refreshDidDocument();
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
    // and then the DID signature around it, which is
    const authorizedTx = await Did.authorizeBatch({
      batchFunction: api.tx.utility.batch,
      did: state.didDocument.uri,
      extrinsics: prepareServiceEndpointTXs(api, fileCid),
      sign: sign,
      submitter: account.address as KiltAddress,
    });

    // submit it with
    await Blockchain.signAndSubmitTx(authorizedTx, account);

    toast('Service has been successfully updated', { type: 'success' });
  } else {
    // User doesn't have this service, create service "KiltTransferAssetRecipientV2"
    const authorizedTx = await Did.authorizeTx(
      state.didDocument.uri,
      prepareNewServiceEndpointTx(api, fileCid),
      sign,
      account.address as KiltAddress
    );

    // submit it with
    await Blockchain.signAndSubmitTx(authorizedTx, account);

    toast('Service has been successfully created', { type: 'success' });
  }

  refreshDidDocument();
  loading.value = false;
  editWallets.value = false;
}

async function refreshDidDocument() {
  if (state.didDocument.uri) {
    getDidDocument(state.didDocument.uri);
  }
}
</script>
