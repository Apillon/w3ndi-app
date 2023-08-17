<template>
  <div class="flex">
  <div class="max-w-xl flex flex-col justify-center">
    <h1 class="mb-6">w3ndi</h1>
    <p class="text-body text-base leading-6">
      Three easy steps:
      <ol class="list-decimal text-white pl-5 mb-6">
        <li>Get DID and W3N.</li>
        <li>Add addresses to your W3N</li>
        <li>Share your W3N with friends to receive assets via Nova.</li>
      </ol>
      This app lets you link your web3 name and wallet addresses across various chains. After linking, others can use NOVA wallet with your web3 name to send you funds.
    </p>
    <div class="md:w-1/2 mt-6 ">
      <Btn type="primary" @click="emit('proceed')">Enter now</Btn>
    </div>
  </div>
  <div :class="$style.mockup">
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