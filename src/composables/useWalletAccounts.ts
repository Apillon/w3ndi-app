import { useProvider } from './useProvider';

const waLoading = ref(true); // disable interaction while setting metamask account/chain
const waInitialized = ref(false); // is window.ethereum initialized
const waConnected = ref(false); // is metamask account connected
const waChainConnected = ref(false); // is metamask chain connected

export default function useWalletAccounts() {
  const { ethereum, provider, userAccount, setUserAccount, setChainId, resetProvider } =
    useProvider();

  const statusMessage = ref('Waiting for wallet...');

  const isReady = computed(() => {
    return !waLoading.value && waInitialized.value && waConnected.value;
  });

  watch(provider, async val => {
    waInitialized.value = !!val;

    if (val) {
      registerEventHandlers();
      await checkForConnectedAccount();
      await checkChain();
    }
  });

  onMounted(async () => {
    registerEventHandlers();
    waLoading.value = false;
  });

  onUnmounted(() => {
    removeEventHandlers();
  });

  function registerEventHandlers() {
    if (ethereum.value) {
      ethereum.value.on('accountsChanged', handleAccountsChanged);
      ethereum.value.on('chainChanged', handleChainChanged);
      ethereum.value.on('disconnect', handleDisconnect);
    }
  }

  function removeEventHandlers() {
    if (ethereum.value) {
      ethereum.value.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.value.removeListener('chainChanged', handleChainChanged);
      ethereum.value.removeListener('disconnect', handleDisconnect);
    }
  }

  async function checkForConnectedAccount() {
    if (!waInitialized.value) {
      console.error('Wallet not initialized');
      return;
    }

    if (!ethereum.value) {
      console.error('Ethereum not initialized');
      return;
    }

    try {
      await handleAccountsChanged();
    } catch (err) {
      console.error(err);
      showError();
    }
  }

  async function checkChain() {
    if (!ethereum.value) {
      console.error('Ethereum not initialized');
      return;
    }

    if (ethereum?.value?.providers) {
      for (const provider of ethereum?.value?.providers) {
        const chainId = await provider.request({ method: 'eth_chainId' });

        // return the first chainId that is not null.
        if (chainId !== '0x0') {
          handleChainChanged(chainId);
          break;
        }
      }
    } else {
      const chainId = await ethereum.value.request({ method: 'eth_chainId' });
      handleChainChanged(chainId);
    }
  }

  async function handleAccountsChanged() {
    if (!provider.value) {
      console.error('Provider not initialized');
      return '';
    }

    // Get accounts from ethers, which respects capitalization
    const accounts = await provider.value.listAccounts();

    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      setUserAccount('');
      waConnected.value = false;
      statusMessage.value = 'Please connect to a wallet';
      return '';
    } else if (accounts[0] !== userAccount.value) {
      setUserAccount(accounts[0]);
      waConnected.value = true;
      return accounts[0];
    } else if (userAccount.value) {
      // account is connected and unchanged
      setUserAccount(userAccount.value); // still run check for correct wallet
      waConnected.value = true;
      return accounts[0];
    }

    return '';
  }

  function handleChainChanged(chainId: string | number) {
    if (chainId === '0x0' || chainId === '0' || Number(chainId) === 0) {
      showError('Please connect or unlock wallet');
      return;
    }

    if (typeof chainId === 'number') {
      chainId = `0x${chainId.toString(16)}`;
    }

    setChainId(chainId);
  }

  async function handleDisconnect(_code: any, _reason: any) {
    resetProvider();
  }

  /**
   * Trigger wallet modal if NO account already set
   */
  async function connectToAccount() {
    if (!waInitialized.value || !ethereum.value) {
      showError('Wallet not initialized');
      return;
    }

    let walletAddress = '';

    try {
      waLoading.value = true;

      if (ethereum.value.isCoinbaseWallet) {
        await ethereum.value.enable();
        await ethereum.value.request({
          method: 'eth_requestAccounts',
        });
      } else if (!ethereum.value.isWalletConnect) {
        await ethereum.value.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
        await ethereum.value.request({
          method: 'eth_requestAccounts',
        });
      }

      walletAddress = await handleAccountsChanged();
    } catch (err: any) {
      if (err.code === 4001) {
        /**
         * EIP-1193 userRejectedRequest error
         * If this happens, the user rejected the connection request.
         */
        statusMessage.value = 'Please connect to a wallet';
        showError('You have to connect to a wallet to continue');
      } else {
        console.error(err);
        showError('You have to connect to a wallet to continue');
      }
    }

    waLoading.value = false;
    return walletAddress;
  }

  /**
   * Open MetaMask request to change to a specific chain
   * If chain is not added to metamask yet, open request to add it
   */
  async function connectToChain(chainId = '0x13881') {
    if (!waInitialized.value || !ethereum.value) {
      showError('Wallet not initialized');
      return;
    }

    try {
      waLoading.value = true;
      checkChain();
      await ethereum.value.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });

      handleChainChanged(chainId);
    } catch (err: any) {
      console.log(err);
    }

    waLoading.value = false;
  }

  function showError(msg = '') {
    console.error('Wallet Error', msg || 'Check for any pending wallet requests and try again');
  }

  function setLoading(val = true) {
    waLoading.value = val;
  }

  function disconnectAccount() {
    setUserAccount('');
    waConnected.value = false;
    resetProvider();
  }

  return {
    statusMessage,
    waLoading: computed(() => waLoading.value),
    waInitialized: computed(() => waInitialized.value),
    waConnected: computed(() => waConnected.value),
    waChainConnected: computed(() => waChainConnected.value),
    isReady,
    connectToAccount,
    connectToChain,
    disconnectAccount,
    setLoading,
  };
}
