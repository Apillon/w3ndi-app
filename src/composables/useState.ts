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
    state.account = newAccount;
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

  const resetAssetRecipients = () => {
    state.assetRecipients = {} as KiltTransferAssetRecipientV2;
  };

  /** Remove old wallet address and add new address with account data */
  const editAssetRecipient = (
    chainCaip19: string,
    walletAddress: string,
    newAddress: string,
    accountData?: object
  ) => {
    const oldAccountData = state.assetRecipients[chainCaip19][walletAddress];
    removeAssetRecipient(chainCaip19, walletAddress);

    const allAssetRecipients = pushRecipientToAccounts(
      state.assetRecipients,
      chainCaip19,
      newAddress,
      accountData || oldAccountData
    );
    setAssetRecipients(allAssetRecipients);
  };

  const markDeletedAssetRecipient = (chainCaip19: string, walletAddress: string) => {
    // Mark recipient as deleted
    const recipient = state.assetRecipients[chainCaip19][walletAddress];
    editAssetRecipient(chainCaip19, walletAddress, walletAddress, {
      ...recipient,
      deleted: true,
    });
  };

  const unmarkDeletedAssetRecipient = (chainCaip19: string, walletAddress: string) => {
    // Unmark recipient as deleted
    const recipient = state.assetRecipients[chainCaip19][walletAddress];
    if (recipient?.deleted) {
      delete recipient.deleted;
    }

    editAssetRecipient(chainCaip19, walletAddress, walletAddress, recipient);
  };

  const removeAssetRecipient = (chainCaip19: string, walletAddress: string) => {
    const recipients = JSON.parse(JSON.stringify(state.assetRecipients));
    // Remove account
    delete recipients[chainCaip19][walletAddress];

    // Remove chain if this was only account on chain
    if (Object.values(recipients[chainCaip19]).length === 0) {
      delete recipients[chainCaip19];
    }
    state.assetRecipients = recipients;
  };

  const setMnemonic = (mnemonic: string) => {
    state.mnemonic = mnemonic;
  };

  const setSporranAccount = (account: WalletAccount) => {
    state.sporranAccount = account;
  };

  const resetSporranAccount = () => {
    state.sporranAccount = {} as WalletAccount;
  };

  return {
    state: readonly(state),
    setWallet,
    setAccount,
    setName,
    setW3Name,
    setDidDocument,
    setAssetRecipients,
    resetAssetRecipients,
    editAssetRecipient,
    removeAssetRecipient,
    markDeletedAssetRecipient,
    unmarkDeletedAssetRecipient,
    setMnemonic,
    setSporranAccount,
    resetSporranAccount,
  };
}
