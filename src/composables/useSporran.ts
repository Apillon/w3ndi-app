import type { ApiPromise } from '@polkadot/api';
import { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { ConfigService, Did, KiltAddress, connect } from '@kiltprotocol/sdk-js';
import { toast } from 'vue3-toastify';

import { useState } from './useState';
import { KILT_NETWORK } from '~/config';
import { LsKeys } from '~/types';

export const useSporran = () => {
  const { state, setW3Name, setDidDocument, setSporranAccount } = useState();

  let api: ApiPromise;
  const sporranWallet = ref<InjectedExtension | undefined>();
  const loading = ref<boolean>(false);
  const accounts = ref<InjectedAccountWithMeta[]>([]);
  const accountLinked = ref<boolean>(true);

  async function initSporran() {
    // returns an array of all the injected sources
    // (this needs to be called first, before other requests)
    const allInjected = await web3Enable('Apillon_Sporran');

    sporranWallet.value = allInjected.find(item => item.name === SPORRAN);

    if (sporranWallet.value) {
      // returns an array of { address, meta: { name, source } }
      // meta.source contains the name of the extension that provides this account
      const allAccounts = await web3Accounts();
      accounts.value = allAccounts.filter(item => item.meta.source === SPORRAN);
    }
  }

  async function getW3Name(address: string) {
    await connect(KILT_NETWORK);
    api = ConfigService.get('api');

    const didDetails = await api.call.did.queryByAccount(Did.accountToChain(address));

    if (didDetails.isNone) {
      accountLinked.value = false;
      toast('This account is not linked to DID', { type: 'info' });
      return;
    } else {
      accountLinked.value = true;
    }

    const { web3Name, document } = Did.linkedInfoFromChain(didDetails);
    if (web3Name) {
      setW3Name(web3Name);
      setDidDocument(document);

      /** Save this account to LS */
      localStorage.setItem(LsKeys.ACCOUNT_ADDRESS, address);
      localStorage.setItem(LsKeys.DID_URI, document.uri);
      localStorage.setItem(LsKeys.W3NAME, web3Name);
    }
    return web3Name;
  }

  async function connectSporranAccount(account: InjectedAccountWithMeta): Promise<boolean> {
    if (!sporranWallet.value) {
      toast('Sporran wallet is not installed!', { type: 'error' });
      return false;
    }
    setSporranAccount(account);

    const w3n = await getW3Name(account.address);
    return !!w3n;
  }

  async function linkDidToAccount(account: InjectedAccountWithMeta): Promise<void> {
    loading.value = true;
    // to be able to retrieve the signer interface from this account
    // we can use web3FromSource which will return an InjectedExtension type
    const injector = await web3FromAddress(account.address);

    /** Sporran extension */
    const sporranExtension: SporranExtension<PubSubSession> = window.kilt.sporran;

    // Authorizing the tx with the full DID and submitting it with the provided account
    // results in the submitter's account being linked to the DID authorizing the operation.
    const accountLinkingTx = api.tx.didLookup.associateSender();

    try {
      /**
       * Sign extrinsic with DID
       */
      const { signed } = await sporranExtension.signExtrinsicWithDid(
        accountLinkingTx.toJSON() as HexString,
        account.address as KiltAddress,
        state.didDocument.uri
      );

      /** Submit transaction with sporran wallet */
      await api
        .tx(signed)
        .signAndSend(account.address, { signer: injector.signer }, ({ status }) => {
          if (status.isInBlock) {
            toast('DID and account are successfully connected', { type: 'success' });
            getW3NamePool(account.address);
          }
        })
        .catch((error: any) => {
          console.log('transaction failed: ', error);
          toast('Transaction failed', { type: 'error' });
        });
    } catch (error: ReferenceError | TypeError | any) {
      if (error?.message === 'Rejected') {
        toast('You rejected credentials', { type: 'warning' });
      } else {
        toast('Sporran error, check console', { type: 'error' });
      }
      loading.value = false;
    }
  }

  function getW3NamePool(address: string) {
    const getW3NameInterval = setInterval(async () => {
      const w3Name = await getW3Name(address);

      if (w3Name) {
        clearInterval(getW3NameInterval);
        loading.value = false;
      }
    }, 5000);
  }

  return {
    accounts,
    accountLinked,
    loading,
    sporranWallet,
    connectSporranAccount,
    getW3Name,
    initSporran,
    linkDidToAccount,
  };
};
