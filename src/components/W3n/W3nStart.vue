<template>
  <div class="card-dark p-16 text-center max-w-xl">
    <h2 class="mb-2">Do you have a DID?</h2>
    <p>
      Please connect or upload ollis velit risus et est facilisis arcu feugiat dolor. Imperdiet
      proin sit nibh commodo. Nisi habitant nibh ultrices pellentesque.
    </p>
    <div class="actions mt-8 flex gap-8 justify-between">
      <Btn type="primary" @click="emit('proceed')">Yes I do!</Btn>
      <Btn type="secondary" class="bg-bg-dark" @click="router.push('/registration')">Sadly, no</Btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter();
const emit = defineEmits(['proceed']);
</script>
