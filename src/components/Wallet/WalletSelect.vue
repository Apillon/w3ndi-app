<template>
  <div class="flex flex-col gap-8 my-8">
    <div v-for="(wallet, key) in wallets" :key="key">
      <div
        class="h-14 card flex items-center px-4 py-1"
        :class="{ 'cursor-pointer': wallet.installed || true }"
        @click="onSelectWallet(wallet)"
      >
        <SvgInclude v-if="wallet.icon" :name="wallet.icon" class="w-5 mr-2" />
        <Image
          v-else-if="wallet.image"
          :src="wallet.image"
          :alt="wallet.extensionName"
          class="mr-2"
          width="20"
          height="20"
        />
        <div v-else class="w-5 h-5 mr-2"></div>

        <div class="flex-1">
          {{ wallet.title }}
        </div>
        <div class="wallet-install">
          <Btn
            v-if="!wallet.installed"
            class="inline-block"
            type="link"
            :href="getWalletInstallUrl(wallet.installUrl)"
            target="_blank"
          >
            Install
          </Btn>
        </div>
      </div>
      <div v-if="wallet.extensionName === state.name" class="overflow-auto md:overflow-hidden">
        <transition name="slide-down" appear>
          <table v-if="state.accounts && state.accounts.length > 0" class="text-left">
            <thead>
              <tr>
                <th></th>
                <th>Name:</th>
                <th>Address:</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="(account, accountKey) in state.accounts" :key="accountKey">
                <td><img v-if="account?.avatar" :src="account.avatar" /></td>
                <td>{{ account.name }}</td>
                <td class="whitespace-nowrap">
                  {{ truncateWallet(account.address) }}
                </td>
                <td>
                  <Btn type="secondary" @click="connectAccount(account)">
                    <span v-if="actionText" class="whitespace-nowrap"> {{ actionText }} </span>
                    <span v-else class="whitespace-nowrap">Connect wallet</span>
                  </Btn>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else-if="wallet.installed" class="p-4 text-center">
            <h5>You don't have any accounts, create account first</h5>
          </div>
        </transition>
      </div>
    </div>
    <div class="w-full">
      <h3 class="mb-4 tracking-initial">Or select ethereum wallet</h3>

      <div class="flex flex-wrap items-center justify-center">
        <div v-if="loading || waLoading" class="mt-4">
          <Spinner />
        </div>

        <template v-else>
          <button
            v-for="(option, i) in ethWallets"
            :key="i"
            class="mt-4 w-[calc(100%/3)] px-1 pb-2"
            @click="connectEthWallet(option.type)"
          >
            <div
              class="relative flex h-[136px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-neutral-300 px-2 py-4 transition-colors"
            >
              <img :src="option.img" width="60" height="60" />

              <p class="body-sm mt-4 text-center text-neutral-900">
                {{ option.title }}
              </p>
            </div>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import metamask from '~/assets/icons/metamask.svg';
import coinbase from '~/assets/icons/coinbase.svg';
import walletconnect from '~/assets/icons/walletconnect.svg';

import { isWeb3Injected, web3Accounts, web3Enable, packageInfo } from '@polkadot/extension-dapp';
import { toast } from 'vue3-toastify';
import useScreen from '~/composables/useScreen';
import { useState } from '~/composables/useState';
import { ProviderConnectors, useProvider } from '~/composables/useProvider';
import useWalletAccounts from '~/composables/useWalletAccounts';
import { getWallets } from '~/lib/wallet/wallets';
import { getBrowserName, getDeviceName, truncateWallet } from '~/lib/misc-utils';

defineProps({
  actionText: { type: String, default: '' },
});
const emit = defineEmits(['connect']);

const { selectProvider } = useProvider();
const { isReady: isWalletReady, waLoading, connectToAccount } = useWalletAccounts();

const { isLg } = useScreen();
const { state, setWallet, setAccount } = useState();
const wallets = ref<Wallet[]>([]);
const loading = ref<boolean>(false);

const ethWallets = [
  { title: 'MetaMask', img: metamask, type: ProviderConnectors.METAMASK },
  { title: 'Coinbase', img: coinbase, type: ProviderConnectors.COINBASE },
  { title: 'WalletConnect', img: walletconnect, type: ProviderConnectors.WALLETCONNECT },
];

onMounted(() => {
  wallets.value = getWallets();

  if (state.wallet) {
    onSelectWallet(state.wallet);
  }
});

async function onSelectWallet(wallet: Wallet) {
  if (wallet.installed) {
    setWallet(wallet);
  } else {
    const enabled = await web3Enable('Alexa');
    console.log(enabled);
    const extensions = enabled.map(item => item.name);
    toast(extensions.join());

    const accounts = await web3Accounts();
    console.log(accounts);
    const users = accounts.map(item => item.meta.source + ': ' + item.meta.name);
    toast(users.join());
  }
}
function connectAccount(account: WalletAccount) {
  setAccount(account);
  emit('connect');
}

/** Get url by browser or by device, if this install url does not exists, use default value */
function getWalletInstallUrl(urls: Record<string, string>) {
  if (isLg.value) {
    const bn = getBrowserName();
    return bn in urls ? urls[bn] : urls.default;
  }
  const dn = getDeviceName();
  return dn in urls ? urls[dn] : urls.default;
}

async function connectEthWallet(connector = ProviderConnectors.METAMASK) {
  if (loading.value) {
    return;
  }

  loading.value = true;

  if (await selectProvider(connector)) {
    await connectToAccount();
  }

  if (isWalletReady.value) {
    emit('connect');
  } else if (connector === ProviderConnectors.METAMASK) {
    toast('MetaMask extension must be installed in browser.', { type: 'warning' });
  } else {
    toast('Wallet extension must be installed in browser.', { type: 'warning' });
  }

  loading.value = false;
}
</script>
