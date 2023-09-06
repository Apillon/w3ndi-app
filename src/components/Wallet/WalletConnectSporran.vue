<template>
  <div v-if="loadingSporran" class="flex justify-center items-center">
    <Spinner />
  </div>
  <div v-else-if="sporranExtension && sporranWallet" class="flex flex-col mt-8">
    <div v-if="accounts && accounts.length > 0">
      <table class="text-left">
        <thead>
          <tr>
            <th>Name:</th>
            <th>Address:</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(account, accountKey) in accounts" :key="accountKey">
            <td>{{ account.name }}</td>
            <td class="whitespace-nowrap">
              {{ truncateWallet(account.address) }}
            </td>
            <td>
              <Btn
                type="secondary"
                :loading="state.sporranAccount?.address === account.address && !state.w3Name"
                @click="connect(account)"
              >
                <span v-if="actionText" class="whitespace-nowrap"> {{ actionText }} </span>
                <span v-else class="whitespace-nowrap">Connect Sporran</span>
              </Btn>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!accountLinked" class="mt-8 text-center">
        <h3>Now link your DID!</h3>
        <p class="mb-4">
          To use the web3name feature, your DID must be explicitly linked to your account by signing
          twice in Sporran.
        </p>
        <Btn :loading="loading" @click="linkDidToAccount(state.sporranAccount)">Link account</Btn>
      </div>
    </div>
    <div v-else class="p-4 text-center">
      <h5>You don't have any accounts, create account first.</h5>
    </div>
  </div>
  <div v-else class="p-4 text-center">
    <h5>
      You don't have Sporran extension, please install it first here:
      <a
        class="underline"
        href="https://chrome.google.com/webstore/detail/sporran/djdnajgjcbjhhbdblkegbcgodlkkfhcl"
        target="_blank"
      >
        Sporran
      </a>
    </h5>
  </div>
</template>

<script lang="ts" setup>
import { useState } from '~/composables/useState';
import { useSporran } from '~/composables/useSporran';
import { truncateWallet } from '~/lib/misc-utils';

defineProps({
  actionText: { type: String, default: '' },
});

const emit = defineEmits(['proceed']);
const { state, resetSporranAccount } = useState();
const {
  accounts,
  accountLinked,
  loading,
  sporranWallet,
  initSporran,
  connectSporranAccount,
  linkDidToAccount,
} = useSporran();

const loadingSporran = ref<boolean>(true);

onMounted(async () => {
  resetSporranAccount();
  await initSporran();
  loadingSporran.value = false;
});

/** Sporran extension */
const sporranExtension = ref<SporranExtension<PubSubSession>>(window.kilt.sporran);

async function connect(account: WalletAccount) {
  if (await connectSporranAccount(account)) {
    emit('proceed');
  }
}
</script>
