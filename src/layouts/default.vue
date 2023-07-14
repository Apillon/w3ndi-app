<template>
  <div :class="$style.bg">
    <div :class="$style.wrapper">
      <Nav />
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="postcss" module>
.bg {
  @apply min-h-screen flex justify-center items-center;
}
.wrapper {
  @apply relative w-screen max-w-md p-12 bg-bg border-1 border-bg-lighter;
}
</style>
