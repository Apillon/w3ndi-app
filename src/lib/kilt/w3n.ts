import { blake2AsU8a } from '@polkadot/util-crypto';
import { base64urlpad } from 'multiformats/bases/base64';
import canonicalize from 'canonicalize';
import { Buffer } from 'buffer';
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
