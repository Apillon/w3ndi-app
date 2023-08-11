import { blake2AsU8a, decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { hexToU8a, isHex, objectEntries } from '@polkadot/util';
import { ethers } from 'ethers';
import { base64urlpad } from 'multiformats/bases/base64';
import canonicalize from 'canonicalize';
import { CHAINS_DATA, ChainsNamespaces } from '~/types';

export const hashKiltTransferAssetRecipient = (doc: any) => {
  const canonicalJson = canonicalize(doc);
  const buffer = Buffer.from(canonicalJson as any);
  const hash = blake2AsU8a(buffer);
  const encoded = base64urlpad.encode(hash);
  return Buffer.from(encoded).toString('utf-8');
};

export const chainIdToName = (chainId: string, chainNamespace?: string) => {
  if (!chainNamespace) {
    Object.keys(CHAINS_DATA).forEach(key => {
      if (chainId.includes(key)) {
        chainNamespace = key;
      }
    });
  }
  if (!chainNamespace) {
    chainNamespace = '';
  }
  return checkIfKeyExist(CHAINS_DATA, chainNamespace) &&
    checkIfKeyExist(CHAINS_DATA[chainNamespace], chainId)
    ? CHAINS_DATA[chainNamespace][chainId]?.name
    : '';
};

export function validateAddress(chainType: string, address: string): boolean {
  switch (chainType) {
    case ChainsNamespaces.ETHEREUM:
      return isValidEthereumAddress(address);
    case ChainsNamespaces.POLKADOT:
      return isValidPolkadotAddress(address);
    default:
      return true;
  }
}

export const isValidPolkadotAddress = (address: string) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));

    return true;
  } catch (error) {
    return false;
  }
};

export const isValidEthereumAddress = (address: string) => {
  try {
    return ethers.utils.isAddress(address);
  } catch (error) {
    return false;
  }
};

export function convertToSS58(text: string, prefix: number, isShort = false): string {
  if (!text) {
    return '';
  }

  try {
    let address = encodeAddress(text, prefix);
    const length = 8;

    if (isShort) {
      address = address.substr(0, length) + '...' + address.substr(address.length - length, length);
    }

    return address;
  } catch (error) {
    return '';
  }
}

export function convertAddressForChain(chainType: string, chainId: string, address: string) {
  if (
    !checkIfKeyExist(CHAINS_DATA, chainType) ||
    !checkIfKeyExist(CHAINS_DATA[chainType], chainId)
  ) {
    return address;
  }
  const ss58Prefix = CHAINS_DATA[chainType][chainId].ss58Prefix;

  if (ss58Prefix === undefined || ss58Prefix < 0) {
    return address;
  }
  return convertToSS58(address, ss58Prefix);
}

export function pushRecipientToAccounts(
  accounts: KiltTransferAssetRecipientV2,
  chainCaip19: string,
  walletAddress: string,
  data: any
) {
  if (Object.keys(accounts).includes(chainCaip19)) {
    return {
      ...accounts,
      [chainCaip19]: {
        ...accounts[chainCaip19],
        [walletAddress]: data,
      },
    };
  } else {
    return {
      ...accounts,
      [chainCaip19]: { [walletAddress]: data },
    };
  }
}
