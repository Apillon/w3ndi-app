declare global {
  interface WindowNova {
    send: (path: string, data: any) => void
    walletExtension: {
      onAppResponse: (msgType: string, response: any, error: Error) => void
      onAppSubscription: (requestId: string, subscriptionString: string) => void
      isNovaWallet: boolean
    },
    injectedWeb3: {
      [key: string]: {}
    }
  }
}

export type MessageData = {
  id: string
  message: string
  request: object
  origin: string
}

export type Handler = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data?: any) => void;
  reject: (error: Error) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscriber?: (data: any) => void;
}

export type Handlers = Map<string, Handler>;



export interface SignerPayloadRawBase {
  /**
   * @description The hex-encoded data for this request
   */
  data: string;

  /**
   * @description The type of the contained data
   */
  type?: 'bytes' | 'payload';
}

export interface SignerPayloadRaw extends SignerPayloadRawBase {
  /**
   * @description The ss-58 encoded address
   */
  address: string;

  /**
   * @description The type of the contained data
   */
  type: 'bytes' | 'payload';
}