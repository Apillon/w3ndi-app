import { blake2AsU8a, decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { hexToU8a, isHex } from '@polkadot/util';
import { ethers } from 'ethers';
import { base64urlpad } from 'multiformats/bases/base64';
import canonicalize from 'canonicalize';
import { Chains } from '~/types';

export const hashKiltTransferAssetRecipient = (doc: any) => {
  const canonicalJson = canonicalize(doc);
  const buffer = Buffer.from(canonicalJson as any);
  const hash = blake2AsU8a(buffer);
  const encoded = base64urlpad.encode(hash);
  return Buffer.from(encoded).toString('utf-8');
};

export const chainIdToName = (chainId: string) => {
  switch (chainId) {
    case Chains.ETHEREUM:
      return 'Ethereum';
    case Chains.KUSAMA:
      return 'Kusama';
    case Chains.KILT:
      return 'Kilt';
    case Chains.POLKADOT:
      return 'Polkadot';
    default:
      return '';
  }
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