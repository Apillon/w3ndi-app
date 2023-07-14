import { DidUri } from '@kiltprotocol/sdk-js';
import { DidResourceUri, IEncryptedMessage, KiltAddress } from '@kiltprotocol/types';
import { CommonErrors } from '~/types';

/**
 * Apillon supported (public + internal) Sporran versions: 2022.12.13, 2023.1.23;
 */

export const SPORRAN = 'Sporran';

export const apiWindow = window as unknown as {
  kilt: {
    meta?: { versions: { credentials: string } };
    sporran?: SporranExtension<PubSubSession>;
  };
};

declare global {
  interface SporranExtension<T> {
    startSession: (
      dAppName: string,
      dAppEncryptionKeyId: DidResourceUri,
      challenge: string
    ) => Promise<T>;

    name: string;
    version: string;
    specVersion: '3.0';

    getDidList: () => Promise<Array<{ did: DidUri; name?: string }>>;

    signWithDid: (
      plaintext: string,
      didUri?: DidUri
    ) => Promise<{ signature: string; didKeyUri: DidResourceUri }>;

    signExtrinsicWithDid: (
      extrinsic: HexString,
      signer: KiltAddress,
      didUri?: DidUri
    ) => Promise<{ signed: HexString; didKeyUri: DidResourceUri }>;

    getSignedDidCreationExtrinsic: (
      submitter: KiltAddress,
      pendingDidUri?: DidUri
    ) => Promise<{ signedExtrinsic: HexString }>;
  }

  // Sporran 2023.1.23 >=
  // The mayor difference is the encryptionKeyId vs encryptionKeyUri parameter change
  interface PubSubSession {
    listen: (callback: (message: IEncryptedMessage) => Promise<void>) => Promise<void>;
    send: (message: IEncryptedMessage) => Promise<void>;
    close: () => Promise<void>;
    encryptionKeyUri: DidResourceUri;
    encryptedChallenge: string;
    nonce: string;
  }

  interface IEncryptedMessageV1 {
    receiverKeyId: DidResourceUri;
    senderKeyId: DidResourceUri;
    ciphertext: string;
    nonce: string;
  }

  interface SporranSessionValues {
    dAppEncryptionKeyUri: DidResourceUri;
    challenge: any;
    sessionId: string;
    dAppName: string;
  }

  type HexString = `0x${string}`;
  interface SporranSession {
    session?: any | null;
    sessionId?: string | null;
    error?: CommonErrors | string | null;
  }
  interface SporranMessage {
    ciphertext: string;
    nonce: string;
    receiverKeyUri: DidResourceUri;
    senderKeyUri: DidResourceUri;
  }
}
