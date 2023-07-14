<template>
  <nav class="max-w-7xl w-full px-8 py-4 mx-auto flex gap-8 justify-between items-center">
    <div>
      <RouterLink to="/">
        <SvgInclude :name="SvgNames.Logo" />
      </RouterLink>
    </div>
    <div>
      <WalletConnect v-if="state.w3Name" />
    </div>
  </nav>
</template>
<script lang="ts" setup>
import { useState } from '~/composables/useState';
import { SvgNames } from './SvgInclude.vue';

const { state } = useState();
</script>
