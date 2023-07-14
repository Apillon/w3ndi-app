import {
  KiltKeyringPair,
  VerificationKeyRelationship,
  DidUri as DidUriType,
  NewDidEncryptionKey,
  SignCallback,
  MessageBody,
  IEncryptedMessage,
  KiltAddress,
  DidDocument,
} from '@kiltprotocol/types';

export const KILT_TRANSFER_ASSET_RECIPIENT_V2 = 'KiltTransferAssetRecipientV2';
declare global {
  type DidUri = DidUriType;

  interface Presentation {
    claim: any;
    legitimations: any;
    claimHashes: any;
    claimNonceMap: any;
    rootHash: any;
    delegationId: any;
    claimerSignature: {};
  }

  interface Keypairs {
    authentication: KiltKeyringPair;
    encryption: NewDidEncryptionKey;
    assertion: KiltKeyringPair;
    delegation: KiltKeyringPair;
  }

  interface SignRequestData {
    data: Uint8Array;
    keyRelationship: VerificationKeyRelationship;
    did: DidUri;
  }

  interface IdentityDidCrypto {
    didDocument: DidDocument;
    keypair: KiltKeyringPair;
    authenticationKey: KiltKeyringPair;
    sign: SignCallback;
    encrypt: (messageBody: MessageBody, dAppDidDocument: DidDocument) => Promise<IEncryptedMessage>;
  }

  interface Identity {
    address: KiltAddress;
    did?: DidUri;
    name: string;
    index: number;
    deletedDid?: DidUri;
  }

  interface KiltTransferAssetRecipientV2Data {
    description: string;
    proof?: {
      scheme: string;
      hash: string;
      signature: string;
    };
  }

  type EncodedVerificationKey = { sr25519: Uint8Array };
  type EncodedEncryptionKey = { x25519: Uint8Array };
  type EncodedKey = EncodedVerificationKey | EncodedEncryptionKey;
  type EncodedSignature = EncodedVerificationKey;
  type IdentitiesMap = Record<string, Identity>;
  type KiltTransferAssetRecipientV2 = Record<
    string,
    Record<string, KiltTransferAssetRecipientV2Data>
  >;

  /** Papa parser */
  type CsvFileData = {
    data: Array<any>;
    errors: Array<any>;
    meta: {
      aborted: boolean;
      cursor: number;
      delimeter: string;
      fields: Array<string>;
      linebreak: string;
      truncated: boolean;
    };
  };
}
