import { DidDocument } from '@kiltprotocol/types';
import { reactive, readonly } from 'vue';
import { getWalletBySource } from '~/lib/wallet/wallets';

export const AuthLsKeys = {
  WALLET: 'oauth_wallet',
};

const state = reactive<StateInterface>({
  name: localStorage.getItem(AuthLsKeys.WALLET) || '',
  account: {} as WalletAccount,
  accounts: [] as WalletAccount[],
  didDocument: {} as DidDocument,
  assetRecipients: {} as KiltTransferAssetRecipientV2,
  mnemonic: '',
  wallet: getWalletBySource(localStorage.getItem(AuthLsKeys.WALLET)),
  w3Name: '',
  sporranAccount: {} as WalletAccount,
});

export function useState() {
  const setAccount = async (newAccount: WalletAccount) => {
    const signature = await getMessageSignature(newAccount.address, 'Connect wallet');
    if (signature) {
      state.account = newAccount;
    } else {
      state.account = {} as WalletAccount;
    }
  };

  const setName = (walletName: string) => {
    state.name = walletName;
    localStorage.setItem(AuthLsKeys.WALLET, walletName);
  };

  const setWallet = async (wallet: Wallet) => {
    await wallet.enable();
    state.accounts = (await wallet.getAccounts()) || [];

    state.wallet = wallet;
    setName(wallet.extensionName);
  };

  const setW3Name = (w3Name: string) => {
    state.w3Name = w3Name;
  };

  const setDidDocument = (didDocument: DidDocument) => {
    state.didDocument = didDocument;
  };

  const setAssetRecipients = (recipients: KiltTransferAssetRecipientV2) => {
    state.assetRecipients = recipients;
  };

  const removeAssetRecipients = (chainId: string, account: string) => {
    const recipients = JSON.parse(JSON.stringify(state.assetRecipients));
    // Remove account
    delete recipients[chainId][account];

    // Remove chain if this was only account on chain
    if (Object.values(recipients[chainId]).length === 0) {
      delete recipients[chainId];
    }
    state.assetRecipients = recipients;
  };

  const setMnemonic = (mnemonic: string) => {
    state.mnemonic = mnemonic;
  };

  const setSporranAccount = (account: WalletAccount) => {
    state.sporranAccount = account;
  };

  async function getMessageSignature(address: string, msg: string) {
    const signer = state.wallet?.signer || null;

    if (!signer) {
      return;
    }

    if (signer && signer.signRaw) {
      try {
        const signPromise = await signer.signRaw({
          address,
          data: msg,
          type: 'bytes',
        });

        return signPromise.signature;
      } catch (e) {
        console.error(e);
      }
    }

    return '';
  }

  return {
    state: readonly(state),
    setWallet,
    setAccount,
    setName,
    setW3Name,
    setDidDocument,
    setAssetRecipients,
    removeAssetRecipients,
    setMnemonic,
    setSporranAccount,
  };
}
