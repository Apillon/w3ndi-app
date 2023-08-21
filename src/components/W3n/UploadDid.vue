<template>
  <div>
    <Input id="mnemonic" label="User Mnemonic" placeholder="Type text here" v-model="mnemonic" />
    <Btn
      :loading="loading"
      :disabled="disabled"
      v-tooltip:top.tooltip="disabled ? 'Upload digital identity and provide Mnemonic' : ''"
      @click="verifyDid()"
    >
      Proceed
    </Btn>
  </div>
</template>

<script lang="ts" setup>
import { toast } from 'vue3-toastify';
import { useState } from '~/composables/useState';
import { useDid } from '~/composables/useDid';
import { LsKeys } from '~/types';

const emit = defineEmits(['proceed']);
const { setMnemonic } = useState();
const { getDidDocumentFromMnemonic } = useDid();

const mnemonic = ref<string>('');
const loading = ref<boolean>(false);
const disabled = ref<boolean>(false);

async function verifyDid() {
  if (!mnemonic.value) {
    toast('Enter mnemonic!', { type: 'warning' });
    return;
  }
  loading.value = true;

  try {
    const { web3Name, document } = await getDidDocumentFromMnemonic(mnemonic.value);

    /** Check if user has Web3Name */
    if (web3Name) {
      setMnemonic(mnemonic.value);

      /** Save Mnemonic to LS */
      localStorage.setItem(LsKeys.MNEMONIC, mnemonic.value);
      emit('proceed');
    } else if (document && document?.uri) {
      toast('Please create web3name in sporran to continue.', { type: 'info' });
    } else {
      toast('Invalid identity, please use another mnemonic.', { type: 'warning' });
    }
  } catch (error) {
    console.error(error);
    toast('Wrong mnemonic, please provide a valid mnemonic.', { type: 'error' });
  }
  loading.value = false;
}
</script>
