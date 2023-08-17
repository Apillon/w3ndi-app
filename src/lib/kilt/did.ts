import {
  ConfigService,
  connect,
  Did,
  KiltKeyringPair,
} from '@kiltprotocol/sdk-js';
import * as kiltUtils from '~/lib/kilt/utils';
import * as config from '~/config';

export async function getDidUriFromKeypair(authentication: KiltKeyringPair) {
  const didUri = Did.getFullDidUriFromKey(authentication);
  return didUri;
}

export async function getDidDocument(mnemonic: string) {
  await connect(config.KILT_NETWORK);
  const api = ConfigService.get('api');

  const { authentication } = await kiltUtils.generateKeypairs(mnemonic);

  const didUri = Did.getFullDidUriFromKey(authentication);
  const encodedFullDid = await api.call.did.query(Did.toChain(didUri));
  const { document } = Did.linkedInfoFromChain(encodedFullDid);

  return document;
}
