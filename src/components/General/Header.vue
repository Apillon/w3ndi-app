<template>
  <nav class="max-w-7xl w-full px-8 py-5 mx-auto flex gap-8 justify-between items-center">
    <div class="py-2">
      <RouterLink to="/">
        <SvgInclude :name="SvgNames.Logo" />
      </RouterLink>
    </div>
    <div class="py-2">
      <Btn
        v-if="state.sporranAccount?.address"
        v-bind="$attrs"
        type="secondary"
        class="bg-bg-dark !text-blue"
        @click="disconnectSporran"
      >
        Disconnect Sporran
      </Btn>
    </div>
  </nav>
</template>
<script lang="ts" setup>
import { useState } from '~/composables/useState';
import { SvgNames } from '../Parts/SvgInclude.vue';

const { state, resetState } = useState();

function disconnectSporran() {
  resetState();
}
</script>
