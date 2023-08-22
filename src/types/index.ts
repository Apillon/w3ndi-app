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
    value: string | Number;
    label: string;
    selected?: boolean;
    disabled?: boolean;
  };
  type KeyValue = {
    key: string | number;
    value: string | number;
  };
  interface ChainOption extends SelectOption, ChainData {}

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

  type ChainData = {
    chainType: number;
    name: string;
    caip19: string;
    ss58Prefix?: number;
  };

  interface ChainDataRadio extends ChainData {
    selected: boolean;
  }
}

export enum W3nPageStep {
  START = 1,
  DID = 2,
  PROFILE = 3,
}

export enum DeployStep {
  IDLE = 0,
  FILE_GENERATION = 1,
  FILE_UPLOAD = 2,
  CONF_REMOVE = 3,
  CONF_SAVE = 4,
  COMPLETED = 5,
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

export enum ChainType {
  OTHER = 0,
  EVM = 1,
  SUBSTRATE = 2,
}
export enum ChainCaip19 {
  BITCOIN = 'bip122:000000000019d6689c085ae165831e93/slip44:0',
  ETHEREUM = 'eip155:1/slip44:60',
  POLKADOT = 'polkadot:91b171bb158e2d3848fa23a9f1c25182/slip44:354',
}

/** Local storage keys */
export enum LsKeys {
  DID_URI = 'apillon_oauth_did_uri',
  MNEMONIC = 'apillon_oauth_mnemonic',
  ACCOUNT_ADDRESS = 'apillon_oauth_account_address',
  W3NAME = 'apillon_oauth_w3name',
}
