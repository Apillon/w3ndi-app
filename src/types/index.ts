import { DidDocument } from '@kiltprotocol/types';
import { InjectedWindow } from '@polkadot/extension-inject/types';

declare global {
  /**
   * Window
   */
  interface Window extends WindowNova, InjectedWindow {
    kilt: any;
  }

  type SelectOption = {
    value: String | Number;
    label: String;
  };
  type KeyValue = {
    key: string | number;
    value: string | number;
  };

  /** State */
  interface StateInterface {
    name: string;
    account: WalletAccount;
    accounts: WalletAccount[];
    didDocument: DidDocument;
    assetRecipients: KiltTransferAssetRecipientV2;
    mnemonic: string;
    wallet?: Wallet;
    w3Name: string;
    sporranAccount: WalletAccount;
  }
}

export enum W3nPageStep {
  DID = 1,
  PROFILE = 2,
}

export enum CommonErrors {
  UNHANDLED_ERROR = 'An exception occurred. Please contact support',
  SPORRAN_NO_EXTENSION = 'Sporran extension was not detected',
  SPORRAN_UNHANDLED_EXCEPTION = 'An exception has occurred while establishing a session with Sporran. Please contact support for further information.',
}


export interface UserOptions {
  layoutsDirs?: string | string[];
  exclude: string[];
  defaultLayout?: string;
}

/** Chains - CAIP-19 identifier */
export enum Chains {
  POLKADOT = 'polkadot:91b171bb158e2d3848fa23a9f1c25182/slip44:354',
  KILT = 'polkadot:411f057b9107718c9624d6aa4a3f23c1/slip44:2086',
  KUSAMA = 'polkadot:b0a8d493285c2df73290dfb7e61f870f/slip44:434',
  ETHEREUM = 'eip155:1/slip44:60',
}

/** Local storage keys */
export enum LsKeys {
  DID_URI = 'apillon_oauth_did_uri',
  MNEMONIC = 'apillon_oauth_mnemonic',
  ACCOUNT_ADDRESS = 'apillon_oauth_account_address',
  W3NAME = 'apillon_oauth_w3name',
}

type ChainData = {
  name: string,
  caip: string,
  ss58Prefix?: number,
}

export const CHAINS_DATA: Record<string, ChainData> = {
  [Chains.POLKADOT]: {
    name: 'Polkadot',
    caip: Chains.POLKADOT,
    ss58Prefix: 0,
  },
  [Chains.KILT]: {
    name: 'Kilt',
    caip: Chains.KILT,
    ss58Prefix: 38,
  },
  [Chains.KUSAMA]: {
    name: 'Kusama',
    caip: Chains.KUSAMA,
    ss58Prefix: 2,
  },
  [Chains.ETHEREUM]: {
    name: 'Ethereum',
    caip: Chains.ETHEREUM,
  },
}