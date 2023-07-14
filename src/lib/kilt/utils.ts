import type { KeyringOptions } from '@polkadot/keyring/types';
import { Utils, connect } from '@kiltprotocol/sdk-js';
import {
  KiltKeyringPair,
  NewDidEncryptionKey,
} from '@kiltprotocol/types';
import {
  mnemonicToMiniSecret,
  mnemonicGenerate,
  blake2AsU8a,
  keyExtractPath,
  keyFromPath,
  naclBoxPairFromSecret,
  sr25519PairFromSeed,
  cryptoWaitReady,
} from '@polkadot/util-crypto';
import { Keypair } from '@polkadot/util-crypto/types';
import { KILT_NETWORK } from '~/config';

export function generateMnemonic() {
  return mnemonicGenerate();
}

// This function basically creates a keyring from a mnemonic
export async function generateAccount(mnemonic: string) {
  await connect(KILT_NETWORK);
  await cryptoWaitReady();
  const keyringOptions: KeyringOptions = {
    ss58Format: 38,
    type: 'sr25519',
  };

  const keyring = new Utils.Keyring(keyringOptions);
  return keyring.addFromMnemonic(mnemonic);
}

export async function generateKeypairs(mnemonic: string) {
  const account = await generateAccount(mnemonic);

  // Authenticate presentations
  const authentication = {
    ...account.derive('//did//0'),
    type: 'sr25519',
  } as KiltKeyringPair;

  // Key used to attest transacations
  const assertionMethod = {
    ...account.derive('//did//assertion//0'),
    type: 'sr25519',
  } as KiltKeyringPair;
  // Key used for authority delgation
  const capabilityDelegation = {
    ...account.derive('//did//delegation//0'),
    type: 'sr25519',
  } as KiltKeyringPair;

  // Used to encrypt and decrypt messages
  const keyAgreement: NewDidEncryptionKey & Keypair = (function () {
    const secretKeyPair = sr25519PairFromSeed(mnemonicToMiniSecret(mnemonic));
    const { path } = keyExtractPath('//did//keyAgreement//0');
    const { secretKey } = keyFromPath(secretKeyPair, path, 'sr25519');
    return {
      ...naclBoxPairFromSecret(blake2AsU8a(secretKey)),
      type: 'x25519',
    };
  })();

  return {
    account: account,
    authentication: authentication,
    keyAgreement: keyAgreement,
    assertionMethod: assertionMethod,
    capabilityDelegation: capabilityDelegation,
  };
}
