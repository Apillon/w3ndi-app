import { IEncryptedMessage } from '@kiltprotocol/sdk-js';
import { CommonErrors } from '~/types';
import { $api } from '../api';

export async function initConnection() {
  let session = null;
  const sporran = apiWindow.kilt.sporran;
  if (!sporran) {
    return { session: null, sessionId: null, error: CommonErrors.SPORRAN_NO_EXTENSION };
  }

  // dAppEncryptionKeyUri, challenge, sessionId, dAppName
  const { values, error } = await getSessionValues();

  if (!values && error) {
    return { session: null, sessionId: null, error: error };
  }

  let sessionValues: SporranSessionValues = values;

  const startSession = async (extension: SporranExtension<PubSubSession>) => {
    try {
      if (!extension) {
        return { session: null, sessionId: null, error: CommonErrors.SPORRAN_NO_EXTENSION };
      }

      console.log('Starting session with Sporran ...');
      console.log('Session values ', sessionValues);
      session = await extension.startSession(
        sessionValues.dAppName,
        sessionValues.dAppEncryptionKeyUri,
        sessionValues.challenge
      );

      console.log('Session started ...', session);
    } catch (error) {
      console.error(error);
      return { session: null, sessionId: null, error: CommonErrors.SPORRAN_UNHANDLED_EXCEPTION };
    }

    return { session: session, sessionId: sessionValues.sessionId, error: null };
  };

  try {
    const { session: any, sessionId: sessionId, error } = await startSession(sporran);
    let verified = false;

    if (session) {
      // Verify session on BE
      const verificationData = await verifySession(session, sessionValues.sessionId);
      if (verificationData.verified) {
        verified = true;
        console.log('Sporran => Connection successfull!');
      }
    }

    return verified
      ? { session: session, sessionId: sessionId }
      : { error: CommonErrors.SPORRAN_UNHANDLED_EXCEPTION };
  } catch (error) {
    return { error: CommonErrors.SPORRAN_UNHANDLED_EXCEPTION };
  }
}

async function getSessionValues() {
  const { data, error } = await $api.get(`/sporran/session-values`);
  if (error) {
    return { values: null, error: CommonErrors.SPORRAN_UNHANDLED_EXCEPTION };
  }

  const values = data.data;

  const sessionValues: SporranSessionValues = {
    dAppEncryptionKeyUri: values.dAppEncryptionKeyUri,
    challenge: values.challenge,
    sessionId: values.sessionId,
    dAppName: values.dAppName,
  };

  return { values: sessionValues, error };
}

// Calls BE and verifies the correctness of the established session
async function verifySession(sessionData: PubSubSession, sessionId: string) {
  let error;
  const resp: any = await $api.post(`/sporran/verify-session`, {
    ...sessionData,
    sessionId: sessionId,
  });
  if (resp.error) {
    error = error;
  }

  if (resp.data.data.success) {
    return { verified: CommonErrors.SPORRAN_UNHANDLED_EXCEPTION };
  }

  return { verified: false, error: error };
}

export async function submitAttestationFromSporran(
  encryptionKeyUri: string,
  requestMessage: IEncryptedMessage,
  sessionId: string
) {
  try {
    const resp: any = await $api.post(`/sporran/message/submit-attestation`, {
      encryptionKeyUri: encryptionKeyUri,
      sessionId: sessionId,
      message: requestMessage,
    });

    if (resp.error) {
      return { error: resp.error };
    } else {
      return { message: resp.data.data.message };
    }
  } catch (error) {
    return { error: error };
  }
}

export async function createRequestCredentialMsg(sessionId: string, encryptionKeyUri: string) {
  try {
    const resp: any = await $api.post(`/sporran/message/request-credential`, {
      encryptionKeyUri: encryptionKeyUri,
      sessionId: sessionId,
    });

    if (resp.error) {
      return { error: resp.error };
    } else {
      return { message: resp.data.data.message };
    }
  } catch (error) {
    return { error: error };
  }
}

export async function verifySporranCredentialMsg(
  sessionId: string,
  encryptionKeyUri: string,
  encryptedMessage: IEncryptedMessage
) {
  try {
    const resp: any = await $api.post(`/sporran/message/verify-credential`, {
      encryptionKeyUri: encryptionKeyUri,
      message: encryptedMessage,
      sessionId: sessionId,
    });

    if (resp.error) {
      console.error('Exception occured - ', resp.error);
      return false;
    } else {
      return { verified: resp.data.data.verified, userData: resp.data.data.data };
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
