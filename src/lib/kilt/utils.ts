import type { KeyringOptions } from '@polkadot/keyring/types';
import { ConfigService, Utils, connect, Credential } from '@kiltprotocol/sdk-js';
import { ss58Format } from '@kiltprotocol/utils';
import {
  DidVerificationKey,
  ICredential,
  ICredentialPresentation,
  KiltAddress,
  KiltKeyringPair,
  NewDidEncryptionKey,
  NewDidVerificationKey,
  SignCallback,
} from '@kiltprotocol/types';
import {
  mnemonicToMiniSecret,
  mnemonicGenerate,
  encodeAddress,
  blake2AsU8a,
  randomAsHex,
  keyExtractPath,
  keyFromPath,
  naclBoxPairFromSecret,
  sr25519PairFromSeed,
  cryptoWaitReady,
} from '@polkadot/util-crypto';
import { Keypair, KeypairType } from '@polkadot/util-crypto/types';
import { DEV, KILT_NETWORK } from '~/config';

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

export function getAddressByKey({
  publicKey,
  type,
}: Pick<DidVerificationKey, 'publicKey' | 'type'>): KiltAddress {
  if (type === 'ed25519' || type === 'sr25519') {
    return encodeAddress(publicKey, ss58Format) as KiltAddress;
  }

  // Otherwise it’s ecdsa.
  // Taken from https://github.com/polkadot-js/common/blob/master/packages/keyring/src/pair/index.ts#L44
  const address = publicKey.length > 32 ? blake2AsU8a(publicKey) : publicKey;
  return encodeAddress(address, ss58Format) as KiltAddress;
}

export function publicKeyToChain(key: NewDidVerificationKey | NewDidEncryptionKey): EncodedKey {
  // TypeScript can't infer type here, so we have to add a type assertion.
  return { [key.type]: key.publicKey } as EncodedKey;
}

export async function getStoreTxApillon(
  submitter: any,
  keypairs: any,
  sign: any
): Promise<{ encoded: Uint8Array; encodedSignature: EncodedSignature }> {
  await connect(KILT_NETWORK);
  const api = ConfigService.get('api');
  // Custom getStoreTx function, as taken from the kilt-sdk:
  // Instead of creating a SubmittableExtrinsic, data and signature are
  // returned separately -> Polkadot transaction type
  const { authentication, assertionMethod, capabilityDelegation, keyAgreement } = keypairs;

  const [authenticationKey] = authentication;
  const did = getAddressByKey(authenticationKey as DidVerificationKey);

  const newKeyAgreementKeys = keyAgreement.map(publicKeyToChain);

  // TODO: Not used for MVP, not used for endusers at the moment anyway.
  // Can be populated as needed.
  const newDelegationKey = publicKeyToChain(capabilityDelegation);
  const newServiceDetails = [{}];

  const apiInput = {
    did,
    submitter,
    authentication,
    newKeyAgreementKeys,
    newServiceDetails,
  };

  // CreateType creates an operation type (TODO: I think this is the Polkadot SDK. Check!) DidCreationOperation
  // type, which expects the following properties:
  //   "did": "DidIdentifierOf",
  //   "newAuthenticationKey": "DidVerificationKey",
  //   "newKeyAgreementKeys": "BTreeSet<DidEncryptionKey>",
  //   "newAttestationKey": "Option<DidVerificationKey>",
  //   "newDelegationKey": "Option<DidVerificationKey>",
  //   "newEndpointUrl": "Option<Url>"
  const encoded = api.registry
    .createType(api.tx.did.create.meta.args[0].type.toString(), apiInput)
    .toU8a();

  const signature = await sign({
    data: encoded,
    keyRelationship: 'authentication',
  });

  const encodedSignature = {
    [signature.keyType]: signature.signature,
  } as EncodedSignature;

  return { encoded, encodedSignature: encodedSignature };
}

export async function createPresentation(
  credential: any,
  signCallback: SignCallback
): Promise<ICredentialPresentation> {
  let presentation = null;

  presentation = Credential.createPresentation({
    credential: sporranCredentialToKilt(credential) as ICredential,
    signCallback,
  });

  if (!presentation) {
    presentation = Credential.createPresentation({
      credential: sporranCredentialToKilt(credential) as ICredential,
      signCallback,
    });
  }

  // Create the presentation from credential, DID and challenge
  return presentation;
}

export function makeStoreDidCallback(keypair: KiltKeyringPair) {
  return async function sign({ data }: { data: any }) {
    const signature = keypair.sign(data, { withType: false });
    return {
      signature,
      keyType: keypair.type,
    };
  };
}

export function randomChallenge() {
  return randomAsHex(16);
}

export function sporranCredentialToKilt(credential: any) {
  return {
    ...credential.credential,
    claimerSignature: credential.claimerSignature,
  };
}
