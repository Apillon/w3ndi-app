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

/** Local storage keys */
export enum LsKeys {
  DID_URI = 'apillon_oauth_did_uri',
  MNEMONIC = 'apillon_oauth_mnemonic',
  ACCOUNT_ADDRESS = 'apillon_oauth_account_address',
  W3NAME = 'apillon_oauth_w3name',
}
