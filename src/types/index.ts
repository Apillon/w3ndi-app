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

  type ChainData = {
    name: string,
    caip: string,
    ss58Prefix?: number,
  }
}

export enum W3nPageStep {
  START = 1,
  DID = 2,
  PROFILE = 3,
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
export enum ChainsNamespaces {
  BITCOIN = 'bip122',
  COSMOS = 'cosmos',
  ETHEREUM = 'eip155',
  POLKADOT = 'polkadot',
}
export enum ChainsBitcoin {
  BITCOIN = 'bip122:000000000019d6689c085ae165831e93/slip44:0',
  LITECOIN = 'bip122:12a765e31ffd4059bada1e25190f6e98/slip44:2',
  FEATHERCOIN = 'bip122:fdbe99b90c90bae7505796461471d89a/slip44:8',
}
export enum ChainsCosmos {
  ATOM = 'cosmos:cosmoshub-3/slip44:118',
  BINANCE = 'cosmos:Binance-Chain-Tigris/slip44:714',
  IOV = 'cosmos:iov-mainnet/slip44:234',
}
export enum ChainsEthereum {
  ETHEREUM = 'eip155:1/slip44:60',
  POLYGON = 'eip155:137/slip44:966',
}
export enum ChainsPolkadot {
  POLKADOT = 'polkadot:91b171bb158e2d3848fa23a9f1c25182/slip44:354',
  KUSAMA = 'polkadot:b0a8d493285c2df73290dfb7e61f870f/slip44:434',
  ASTAR = 'polkadot:9eb76c5184c4ab8679d2d5d819fdf90b/slip44:810',
  KILT = 'polkadot:411f057b9107718c9624d6aa4a3f23c1/slip44:2086',
  // MOONBEAM = 'polkadot:9eb76c5184c4ab8679d2d5d819fdf90b/slip44:1284',
  // PHALA = 'polkadot:1bb969d85965e4bb5a651abbedf21a54/slip44:2086',
  // CRUST = 'polkadot:d4c0c08ca49dc7c680c3dac71a7c0703/slip44:2086',
  // HYDRADX = 'polkadot:afdc188f45c71dacbaa0b62e16a91f72/slip44:2086',
}

/** Local storage keys */
export enum LsKeys {
  DID_URI = 'apillon_oauth_did_uri',
  MNEMONIC = 'apillon_oauth_mnemonic',
  ACCOUNT_ADDRESS = 'apillon_oauth_account_address',
  W3NAME = 'apillon_oauth_w3name',
}

export const CHAINS_DATA: Record<string, Record<string, ChainData>> = {
  [ChainsNamespaces.BITCOIN]: {
    [ChainsBitcoin.BITCOIN]: {
      name: 'Bitcoin',
      caip: ChainsBitcoin.BITCOIN,
    },
    [ChainsBitcoin.LITECOIN]: {
      name: 'Litecoin',
      caip: ChainsBitcoin.LITECOIN,
    },
    [ChainsBitcoin.FEATHERCOIN]: {
      name: 'Feathercoin',
      caip: ChainsBitcoin.FEATHERCOIN,
    },
  },
  [ChainsNamespaces.COSMOS]: {
    [ChainsCosmos.ATOM]: {
      name: 'Atom',
      caip: ChainsCosmos.ATOM,
    },
    [ChainsCosmos.BINANCE]: {
      name: 'Binance',
      caip: ChainsCosmos.BINANCE,
    },
    [ChainsCosmos.IOV]: {
      name: 'IOV',
      caip: ChainsCosmos.IOV,
    },
  },
  [ChainsNamespaces.ETHEREUM]: {
    [ChainsEthereum.ETHEREUM]: {
      name: 'Ethereum',
      caip: ChainsEthereum.ETHEREUM,
    },
    [ChainsEthereum.POLYGON]: {
      name: 'Polygon',
      caip: ChainsEthereum.POLYGON,
    },
  },
  [ChainsNamespaces.POLKADOT]: {
    [ChainsPolkadot.POLKADOT]: {
      name: 'Polkadot',
      caip: ChainsPolkadot.POLKADOT,
      ss58Prefix: 0,
    },
    [ChainsPolkadot.KUSAMA]: {
      name: 'Kusama',
      caip: ChainsPolkadot.KUSAMA,
      ss58Prefix: 2,
    },
    [ChainsPolkadot.ASTAR]: {
      name: 'Astar',
      caip: ChainsPolkadot.ASTAR,
      ss58Prefix: 5,
    },
    [ChainsPolkadot.KILT]: {
      name: 'Kilt',
      caip: ChainsPolkadot.KILT,
      ss58Prefix: 38,
    },
  },

}