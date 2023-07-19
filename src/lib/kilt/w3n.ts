import { blake2AsU8a, decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { hexToU8a, isHex } from '@polkadot/util';
import { ethers } from 'ethers';
import { base64urlpad } from 'multiformats/bases/base64';
import canonicalize from 'canonicalize';
import { CHAINS_DATA, Chains } from '~/types';

export const hashKiltTransferAssetRecipient = (doc: any) => {
  const canonicalJson = canonicalize(doc);
  const buffer = Buffer.from(canonicalJson as any);
  const hash = blake2AsU8a(buffer);
  const encoded = base64urlpad.encode(hash);
  return Buffer.from(encoded).toString('utf-8');
};

export const chainIdToName = (chainId: string) => {
  return checkIfKeyExist(CHAINS_DATA, chainId) ? CHAINS_DATA[chainId]?.name : '';
};

export function validateAddress(address: string, chain: string): boolean {
  switch (chain) {
    case Chains.ETHEREUM:
      return isValidEthereumAddress(address);
    default:
      return isValidPolkadotAddress(address);
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

export function convertAddressForChain(address: string, chainId: string) {
  const ss58Prefix = CHAINS_DATA[chainId].ss58Prefix;

  if (ss58Prefix === undefined || ss58Prefix < 0) {
    return address;
  }
  return convertToSS58(address, ss58Prefix);
}