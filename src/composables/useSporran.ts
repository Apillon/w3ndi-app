import type { ApiPromise } from '@polkadot/api';
import type { Option } from '@polkadot/types-codec';
import type { RawDidLinkedInfo } from '@kiltprotocol/augment-api';
import { ConfigService, Did, KiltAddress, connect } from '@kiltprotocol/sdk-js';
import { toast } from 'vue3-toastify';

import { useState } from './useState';
import { useDid } from './useDid';
import { KILT_NETWORK } from '~/config';
import { LsKeys } from '~/types';

export const useSporran = () => {
  const { state, setW3Name, setDidDocument, setSporranAccount, resetSporranAccount } = useState();
  const { loadDidDocument, getDidDocument } = useDid();

  let api: ApiPromise;
  const sporranWallet = ref<Wallet | undefined>();
  const loading = ref<boolean>(false);
  const accounts = ref<WalletAccount[]>([]);
  const accountLinked = ref<boolean>(true);

  async function initSporran() {
    // returns an array of all the injected sources
    // (this needs to be called first, before other requests)
    sporranWallet.value = getWalletBySource(SPORRAN);

    if (sporranWallet.value) {
      // returns an array of { address, meta: { name, source } }
      // meta.source contains the name of the extension that provides this account
      accounts.value = (await sporranWallet.value.getAccounts()) || [];
    } else {
      toast('Please install Sporran wallet.', { type: 'warning' });
    }
  }

  async function getW3Name(address: string, errorMsg: boolean = true) {
    /** Remove data from LS */
    localStorage.removeItem(LsKeys.ACCOUNT_ADDRESS);
    localStorage.removeItem(LsKeys.DID_URI);
    localStorage.removeItem(LsKeys.MNEMONIC);

    const didDetails = await getDidDetailsFromLinkedAccount(address);
    if (didDetails.isNone) {
      return false;
    }

    const { web3Name, document } = Did.linkedInfoFromChain(didDetails);
    if (web3Name) {
      setW3Name(web3Name);
      setDidDocument(document);

      /** Save this account to LS */
      localStorage.setItem(LsKeys.ACCOUNT_ADDRESS, address);
      localStorage.setItem(LsKeys.DID_URI, document.uri);
      localStorage.setItem(LsKeys.W3NAME, web3Name);
    } else if (document && document?.uri) {
      toast('Please create web3name in Sporran to continue.', { type: 'info' });
      resetSporranAccount();
    } else if (errorMsg) {
      toast('Your account doesn`t have web3name!', { type: 'error' });
    }
    return web3Name;
  }

  async function connectSporranAccount(account: WalletAccount): Promise<boolean> {
    if (!sporranWallet.value) {
      toast('Sporran wallet is not installed!', { type: 'error' });
      return false;
    }
    setSporranAccount(account);
    accountLinked.value = true;

    const didDetails = await getDidDetailsFromLinkedAccount(account.address);

    if (didDetails.isNone) {
      /** Sporran extension */
      const sporranExtension: SporranExtension<PubSubSession> = window.kilt.sporran;

      if (typeof sporranExtension.getDidList === 'function') {
        try {
          const didList = await sporranExtension.getDidList();

          if (didList.length && didList[0].did) {
            const { web3Name } = await getDidDocument(didList[0].did);

            if (web3Name) {
              return true;
            }
          }
        } catch (error) {
          console.warn(error);
          sporranErrorMsg(error);
        }
        resetSporranAccount();
        accountLinked.value = false;
        return false;
      } else {
        toast('This account is not linked to DID', { type: 'info' });
        accountLinked.value = false;
        return false;
      }
    } else {
      const w3n = await getW3Name(account.address);
      return !!w3n;
    }
  }

  async function getDidDetailsFromLinkedAccount(
    address: string
  ): Promise<Option<RawDidLinkedInfo>> {
    await connect(KILT_NETWORK);
    api = ConfigService.get('api');
    return await api.call.did.queryByAccount(Did.accountToChain(address));
  }

  async function linkDidToAccount(account: WalletAccount): Promise<void> {
    loading.value = true;
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
        .signAndSend(account.address, { signer: account.signer }, async ({ status }) => {
          if (status.isBroadcast) {
            toast('DID and account are connecting', { type: 'info' });
          } else if (status.isFinalized) {
            await getW3NamePool(account.address, false);
            toast('DID and account are successfully connected', { type: 'success' });
            accountLinked.value = true;
          }
        })
        .catch((error: any) => {
          console.log('transaction failed: ', error);
          sporranErrorMsg(error);
          resetSporranAccount();
          loading.value = false;
        });
    } catch (error: ReferenceError | TypeError | any) {
      sporranErrorMsg(error);
      resetSporranAccount();
      loading.value = false;
    }
  }

  async function getW3NamePool(address: string, errorMsg: boolean) {
    return new Promise(function (resolve) {
      const getW3NameInterval = setInterval(async () => {
        const w3Name = await getW3Name(address, errorMsg);

        if (w3Name) {
          clearInterval(getW3NameInterval);
          resolve(w3Name);
          loading.value = false;
        }
      }, 5000);
    });
  }

  function sporranErrorMsg(error: ReferenceError | TypeError | any = {}) {
    if (error?.message === 'Rejected') {
      toast('Request was rejected in Sporran', { type: 'info' });
    } else if (error?.message.includes('account balance too low')) {
      toast('Your account balance is too low', { type: 'warning' });
    } else if (error?.message.includes('transaction')) {
      toast('Transaction could not be submitted', { type: 'warning' });
    } else if (error?.message.includes('sign')) {
      toast('Transaction could not be signed', { type: 'warning' });
    } else {
      toast('Sporran error, check console', { type: 'error' });
    }
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
    sporranErrorMsg,
  };
};
