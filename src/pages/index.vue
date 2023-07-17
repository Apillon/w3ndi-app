<template>
  <div v-if="loading"></div>
  <template v-else>
    <Transition name="fade" :duration="1000">
      <W3nProfile v-if="pageStep === W3nPageStep.PROFILE" @back="pageStep = W3nPageStep.DID" />
      <W3nDid v-else @proceed="pageStep = W3nPageStep.PROFILE"></W3nDid>
    </Transition>
  </template>
</template>

<script lang="ts" setup>
import { useDid } from '~/composables/useDid';
import { useSporran } from '~/composables/useSporran';
import { useState } from '~/composables/useState';
import { LsKeys, W3nPageStep } from '~/types';

const { setMnemonic } = useState();
const { getDidDocumentFromMnemonic } = useDid();
const { accounts, initSporran, connectSporranAccount } = useSporran();

const loading = ref<boolean>(true);
const pageStep = ref<number>(W3nPageStep.DID);

onMounted(async () => {
  const accountAddress = localStorage.getItem(LsKeys.ACCOUNT_ADDRESS);
  const didUri = localStorage.getItem(LsKeys.DID_URI);
  const mnemonic = localStorage.getItem(LsKeys.MNEMONIC);

  if (!!didUri && !!mnemonic) {
    setMnemonic(mnemonic);
    const { web3Name } = await getDidDocumentFromMnemonic(mnemonic);

    /** Check if user has Web3Name */
    if (web3Name) {
      pageStep.value = W3nPageStep.PROFILE;
    }
    loading.value = false;
  } else if (!!didUri && !!accountAddress) {
    setTimeout(async () => {
      await initSporran();

      /** Find account saved in LS */
      const account = accounts.value.find(item => item.address === accountAddress);

      /** If account exists, connect it with Sporran */
      if (account && (await connectSporranAccount(account))) {
        pageStep.value = W3nPageStep.PROFILE;
      }
      loading.value = false;
    }, 500);
  } else {
    localStorage.removeItem(LsKeys.ACCOUNT_ADDRESS);
    localStorage.removeItem(LsKeys.DID_URI);
    localStorage.removeItem(LsKeys.MNEMONIC);

    loading.value = false;
  }
});
</script>
