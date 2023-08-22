import {
  Blockchain,
  ConfigService,
  Did,
  DidResourceUri,
  KiltAddress,
  connect,
  disconnect,
} from '@kiltprotocol/sdk-js';
import { ApiPromise } from '@polkadot/api';
import { toast } from 'vue3-toastify';

import { useDid } from './useDid';
import { useState } from './useState';
import { useSporran } from './useSporran';

import { KILT_NETWORK } from '~/config';
import { DeployStep } from '~/types/index';

export default function useBlockchain() {
  const { sporranErrorMsg } = useSporran();
  const { state, setAssetRecipients, removeAssetRecipient } = useState();
  const {
    getDidDocument,
    prepareExistingServiceEndpointTx,
    prepareNewServiceEndpointTx,
    prepareServiceEndpointTXs,
  } = useDid();

  let api: ApiPromise;
  const loading = ref<boolean>(false);
  const loadingAssetRecipients = ref<boolean>(false);
  const loadedAssetRecipients = ref<KiltTransferAssetRecipientV2>({});

  const isModalDeployVisible = ref<boolean>(false);
  const deployStep = ref<number>(DeployStep.FILE_GENERATION);

  onBeforeMount(async () => {
    await connect(KILT_NETWORK);
    api = ConfigService.get('api');
  });

  onUnmounted(() => {
    disconnect();
  });

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

  function isTagChanged(chainCaip19: string, walletAddress: string, tag: string) {
    return (
      isExistingAddress(chainCaip19, walletAddress) &&
      loadedAssetRecipients.value[chainCaip19][walletAddress]?.description !== tag
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

  function removeMarkedAccounts() {
    const assetRecipients = JSON.parse(JSON.stringify(state.assetRecipients));

    Object.entries(assetRecipients).forEach(([chain, accounts]) => {
      Object.entries(accounts as KiltTransferAssetRecipientAccount).forEach(
        ([address, account]) => {
          if (account?.deleted) {
            removeAssetRecipient(chain, address);
          }
        }
      );
    });
  }

  async function uploadAccountsToIpfs() {
    removeMarkedAccounts();

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
      } else if (state.mnemonic) {
        await updateFullDid(fileCid);
      } else {
        toast(
          'Transaction could not be submitted. You need Sporran extension in you need to provide mnemonic.',
          { type: 'error' }
        );
      }
    } catch (error) {
      transactionErrorWrapper(error);
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
      try {
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
            transactionErrorWrapper(error);
          });
      } catch (error) {
        transactionErrorWrapper(error);
      }
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
    try {
      const { signed } = await sporranExtension.signExtrinsicWithDid(
        newServiceEndpointTx.toJSON() as HexString,
        account.address as KiltAddress,
        state.didDocument.uri
      );

      /** Submit transaction with sporran wallet */
      await api
        .tx(signed)
        .signAndSend(account.address, { signer: account.signer }, ({ status }) => {
          if (status.isFinalized) {
            deployStep.value = DeployStep.COMPLETED;
            refreshDidDocument();

            setTimeout(() => {
              loading.value = false;
              hideModalDeploy();
            }, 1000);
          }
        })
        .catch((error: any) => {
          transactionErrorWrapper(error);
        });
    } catch (error) {
      transactionErrorWrapper(error);
    }
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
      setTimeout(() => (deployStep.value = DeployStep.CONF_SAVE), 6000);

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
      await getDidDocument(state.didDocument.uri);
      parseAssetRecipients();
    }
  }

  function transactionErrorWrapper(error: ReferenceError | TypeError | any = {}) {
    console.log(error);
    sporranErrorMsg(error);
    hideModalDeploy();
    loading.value = false;
  }

  return {
    deployStep,
    loading,
    loadingAssetRecipients,
    isModalDeployVisible,
    loadedAssetRecipients,
    parseAssetRecipients,
    isExistingAddress,
    isTagChanged,
    saveWallets,
  };
}
