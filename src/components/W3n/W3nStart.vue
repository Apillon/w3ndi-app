<template>
  <div class="flex flex-col md:flex-row">
    <div class="max-w-xl flex flex-col justify-center mb-10 md:mb-0">
      <h1 class="mb-2">w3ndi</h1>
      <h3 class="mb-6">Your web3name-based decentralized index of digital addresses.</h3>
      <p class="text-body text-base leading-6">
        Send and receive assets via your KILT web3name.
        <ol class="list-decimal pl-5 mb-6">
          <li>Get a KILT DID and web3name.</li>
          <li>Link digital addresses to your web3name.</li>
          <li>Share your web3name with friends and receive assets via Nova Wallet</li>
        </ol>
        Link your web3name and wallet addresses across various chains. Use web3name with Nova Wallet to send and receive funds.
      </p>
      <div class="md:w-1/2 mt-6 ">
        <Btn type="primary" @click="emit('proceed')">Enter now</Btn>
      </div>
    </div>
    <div class="w-full flex my-10 md:my-0" :class="$style.mockup">
        <video
          class="mx-auto md:h-full transform-gpu object-contain rounded-3xl"
          :src="NovaWalletVideo"
          :autoplay="true"
          preload="auto"
          playsinline
          muted
          loop
        ></video>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NovaWalletVideo from "~/assets/video/NOVA_Video_2160x960.webm";

const emit = defineEmits(['proceed']);
</script>

<style lang="postcss" module>
.mockup {
  @apply relative min-h-[30rem] lg:min-h-[35rem];
  padding: 7px 0 8px;
  max-height: calc(100lvh - 20rem);

  &::before {    
    content: '';
    @apply absolute left-1/2 top-1/2 w-3/4 h-3/4 max-w-lg max-h-[32rem] block opacity-20 -translate-x-1/2 -translate-y-1/2 -z-1 bg-blue;
    border-radius: 518px;
    filter: blur(70px);
  }
  &::after {  
    content: '';  
    background-image: url('~/assets/images/android-phone-frame.png');
    background-size: auto 100%;
    @apply absolute top-0 left-0 right-0 bottom-0 bg-no-repeat bg-center ;
  }
}
</style>