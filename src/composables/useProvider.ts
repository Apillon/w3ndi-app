// @ts-ignore:next-line
import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min.js';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, providers } from 'ethers';
import { APP_NAME } from '~/config';
import { error } from 'console';

// Shared state
const ethereum = ref<any>();
const provider = ref<providers.Web3Provider | null>();
const userAccount = ref<string>('');
const walletProvider = ref<string>('');
const chainId = ref<string>('');

function ActionReturn(success: boolean, data: any) {
  return { success, data };
}

export const ProviderConnectors = {
  METAMASK: 1,
  COINBASE: 2,
  WALLETCONNECT: 3,
};

export const useProvider = () => {
  async function initProvider() {
    if (provider.value) {
      return ActionReturn(true, provider.value);
    }
    if (await selectProvider()) {
      return ActionReturn(true, provider.value);
    } else {
      return ActionReturn(false, 'Failed to establish wallet connection');
    }
  }

  async function selectProvider(connector = ProviderConnectors.METAMASK) {
    ethereum.value = null;
    provider.value = null;

    walletProvider.value =
      connector === ProviderConnectors.COINBASE
        ? 'Coinbase'
        : connector === ProviderConnectors.WALLETCONNECT
        ? 'WalletConnect'
        : 'MetaMask';

    if (connector === ProviderConnectors.COINBASE) {
      /**
       * COINBASE
       */
      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: APP_NAME,
        appLogoUrl: '',
        darkMode: true,
      });
      ethereum.value = coinbaseWallet.makeWeb3Provider();
    } else if (connector === ProviderConnectors.WALLETCONNECT) {
      /**
       * WALLET CONNECT
       */
      try {
        ethereum.value = new WalletConnectProvider({
          // infuraId: '9aa3d95b3bc440fa88ea12eaa4456161',
          rpc: {
            137: 'https://polygon-rpc.com',
            80001: 'https://matic-mumbai.chainstacklabs.com',
          },
          chainId: parseInt('0x1', 16),
        });

        await (ethereum.value as any).enable();
      } catch (e: any) {
        console.error(e);
        ethereum.value = null;
      }
    } else {
      try {
        const detected = (await detectEthereumProvider()) as any;

        if (detected) {
          if (!Array.isArray(detected.providers)) {
            ethereum.value = detected;
          } else if (Array.isArray(detected.providers)) {
            /**
             * Multiple providers -> look for right connector
             */
            for (const p of detected.providers) {
              if (p.isMetaMask) {
                ethereum.value = p;
                break;
              }
            }

            /**
             * Wallet provider not found, take first injected provider
             */
            if (!ethereum.value && detected.providers.length) {
              ethereum.value = detected.providers[0];
            }
          } else {
            // Only another injected provider is available
            ethereum.value = detected;
          }
        }
      } catch (error) {
        console.log(error);
        return false;
      }
    }

    if (ethereum.value) {
      provider.value = new ethers.providers.Web3Provider(ethereum.value, 'any');
      return true;
    }

    // false if no provider was found
    return false;
  }

  function setUserAccount(value: string) {
    if ((!userAccount.value && !value) || userAccount.value === value) {
      // dont run check if userAccount remains unchanged
      return;
    }

    userAccount.value = value;
  }

  function setChainId(value: string) {
    chainId.value = value;
  }

  function resetProvider() {
    ethereum.value = null;
    provider.value = null;
  }

  return {
    ethereum: computed(() => ethereum.value),
    provider: computed(() => provider.value),
    userAccount: computed(() => userAccount.value),
    walletProvider: computed(() => walletProvider.value),
    chainId: computed(() => chainId.value),

    initProvider,
    selectProvider,
    setUserAccount,
    setChainId,
    resetProvider,
  };
};
