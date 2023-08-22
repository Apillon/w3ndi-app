<template>
  <div class="flex justify-center items-center py-4">
    <a
      class="inline-flex text-sm text-body"
      href="https://github.com/Apillon-web3/w3ndi-app"
      target="_blank"
    >
      Explore the code on
      <SvgInclude class="inline-block w-4 h-4 ml-2 mr-1" :name="SvgNames.Github" />
      GitHub
    </a>
  </div>
</template>

<script lang="ts" setup>
import { SvgNames } from '../Parts/SvgInclude.vue';
</script>
