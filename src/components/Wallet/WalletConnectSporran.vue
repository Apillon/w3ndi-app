<template>
  <div v-if="sporranWallet" class="flex flex-col my-8">
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
      <div v-if="!accountLinked" class="my-4 text-center">
        <h3>You account is not linked to DID!</h3>
        <p>
          To make use of features such as Web3 name, a DID must be explicitly linked the owner
          account.
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
const { state } = useState();
const {
  accounts,
  accountLinked,
  loading,
  sporranWallet,
  initSporran,
  connectSporranAccount,
  linkDidToAccount,
} = useSporran();

onMounted(async () => {
  initSporran();
});

async function connect(account: WalletAccount) {
  if (await connectSporranAccount(account)) {
    emit('proceed');
  }
}
</script>
