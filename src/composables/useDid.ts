import type { Option } from '@polkadot/types';
import type { RawDidLinkedInfo } from '@kiltprotocol/augment-api';
import type { DidInfo } from '@kiltprotocol/did/lib/cjs/Did.rpc';
import type { ApiPromise as ApiPromiseType } from '@polkadot/api';
import type { Extrinsic } from '@polkadot/types/interfaces';

import { ConfigService, Did, DidDocument, DidUri, connect } from '@kiltprotocol/sdk-js';
import { toast } from 'vue3-toastify';

import { useState } from './useState';
import { DEV, KILT_NETWORK } from '~/config';
import { LsKeys } from '~/types';
import { getDidUriFromKeypair } from '~/lib/kilt/did';
import { generateKeypairs } from '~/lib/kilt/utils';
import { KILT_TRANSFER_ASSET_RECIPIENT_V2 } from '~/lib/kilt/types';
import { hashKiltTransferAssetRecipient } from '~/lib/kilt/w3n';

export const useDid = () => {
  const { state, setW3Name, setDidDocument } = useState();

  async function loadDidDocument(didUri: DidUri): Promise<DidInfo> {
    await connect(KILT_NETWORK);
    const api = ConfigService.get('api');
    const encodedFullDid: Option<RawDidLinkedInfo> = await api.call.did.query(Did.toChain(didUri));
    return Did.linkedInfoFromChain(encodedFullDid);
  }

  async function getDidDocument(didUri: DidUri): Promise<DidInfo> {
    try {
      const didInfo = await loadDidDocument(didUri);

      if (didInfo.web3Name) {
        setW3Name(didInfo.web3Name);
        setDidDocument(didInfo.document);

        /** Save data to LS */
        localStorage.setItem(LsKeys.DID_URI, didInfo.document.uri);
        localStorage.setItem(LsKeys.W3NAME, didInfo.web3Name);
      } else {
        toast('Missing Web3Name', { type: 'warning' });
      }
      return didInfo;
    } catch (error) {
      console.warn('Load DID document error: ', error);
      // toast('Load DID document error', { type: 'error' });
    }
    return {
      document: {} as DidDocument,
      accounts: [],
    };
  }

  async function getDidDocumentFromMnemonic(mnemonic: string): Promise<DidInfo> {
    const didUri = await getDidUriFromMnemonic(mnemonic);
    const didInfo = await getDidDocument(didUri);

    if (!didInfo?.document?.uri) {
      const didUriSR = await getDidUriFromMnemonic(mnemonic);
      return await getDidDocument(didUriSR);
    }

    return {
      document: {} as DidDocument,
      accounts: [],
    };
  }

  async function getDidUriFromMnemonic(mnemonic: string) {
    const { authentication } = await generateKeypairs(mnemonic);
    return await getDidUriFromKeypair(authentication);
  }

  function openAccountOnBlockChain(accountAddress: string) {
    if (!accountAddress) {
      toast('Address not defined', { type: 'warning' });
      return;
    }
    if (DEV) {
      window.open(`https://kilt-testnet.subscan.io/account/${accountAddress}`, '_blank');
    } else {
      window.open(`https://spiritnet.subscan.io/account/${accountAddress}`, '_blank');
    }
  }

  function prepareNewServiceEndpointTx(api: ApiPromiseType, fileCid: string): Extrinsic {
    const hash = hashKiltTransferAssetRecipient(state.assetRecipients);

    const service = state.didDocument?.service?.find(item => item.id === `#${hash}`);
    if (service) {
      toast('Service with this ID already exists! Please make some changes.', { type: 'warning' });
      throw Error('Duplicate ID');
    }

    const ipfsDomain = DEV ? 'https://ipfs-dev.apillon.io/ipfs/' : 'https://ipfs2.apillon.io/ipfs';

    return api.tx.did.addServiceEndpoint({
      id: Did.resourceIdToChain(`#${hash}`),
      serviceTypes: [KILT_TRANSFER_ASSET_RECIPIENT_V2],
      urls: [`${ipfsDomain}${fileCid}`], // Only one URL is supported
    });
  }

  function prepareExistingServiceEndpointTx(api: ApiPromiseType): Extrinsic | null {
    // Create the tx to remove the service with ID.
    const service = state.didDocument?.service?.find(item =>
      item.type.includes(KILT_TRANSFER_ASSET_RECIPIENT_V2)
    );

    if (service) {
      // Create the tx to remove the service with ID.
      return api.tx.did.removeServiceEndpoint(Did.resourceIdToChain(service.id));
    }
    return null;
  }

  function prepareServiceEndpointTXs(api: ApiPromiseType, fileCid: string): Extrinsic[] {
    const exsistingService = prepareExistingServiceEndpointTx(api);

    if (exsistingService) {
      return [exsistingService, prepareNewServiceEndpointTx(api, fileCid)];
    }
    return [prepareNewServiceEndpointTx(api, fileCid)];
  }

  return {
    getDidDocument,
    getDidDocumentFromMnemonic,
    openAccountOnBlockChain,
    prepareNewServiceEndpointTx,
    prepareExistingServiceEndpointTx,
    prepareServiceEndpointTXs,
  };
};

