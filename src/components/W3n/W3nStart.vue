<template>
  <div class="flex flex-col-reverse md:flex-row">
    <div class="max-w-xl flex flex-col justify-center mb-10 md:mb-0">
      <h1 class="mb-2">w3ndi</h1>
      <h3 class="mb-6">Your w3n-based decentralized index of digital addresses.</h3>
      <p class="text-body text-base leading-6">
        Send and receive assets via your web3name by KILT.
        <ol class="list-decimal pl-5 mb-6">
          <li>Get a DID and w3n by KILT.</li>
          <li>Add digital addresses to your w3n.</li>
          <li>Share your w3n with friends and receive assets via Nova Wallet.</li>
        </ol>
        Link your web3name and wallet addresses across various chains. Use web3name with Nova Wallet to send and receive funds.
      </p>
      <div class="md:w-1/2 mt-6 ">
        <Btn type="primary" @click="emit('proceed')">Enter now</Btn>
      </div>
    </div>
    <div class="my-10 md:my-0" :class="$style.mockup">
      <img :src="MockupKilt" alt="w3n" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import MockupKilt from "~/assets/images/Mockup-kilt.png";

const emit = defineEmits(['proceed']);
</script>

<style lang="postcss" module>
.mockup {
  @apply relative;
  &::before {    
    content: '';
    @apply absolute left-1/2 top-1/2 w-3/4 h-3/4 max-w-lg max-h-[32rem] block opacity-20 -translate-x-1/2 -translate-y-1/2 -z-1 bg-blue;
    border-radius: 518px;
    filter: blur(70px);
  }
}
</style>