<script setup lang="ts">
const emit = defineEmits<{
  navigate: []
}>()
</script>

<template>
  <p class="mt-4 text-center text-[11px] text-text-muted leading-relaxed">
    Dengan masuk atau mendaftar, Anda menyetujui
    <NuxtLink
      to="/policy/terms"
      class="font-semibold text-primary hover:underline"
      @click="emit('navigate')"
    >
      Syarat &amp; Ketentuan
    </NuxtLink>
    serta
    <NuxtLink
      to="/policy/privacy"
      class="font-semibold text-primary hover:underline"
      @click="emit('navigate')"
    >
      Kebijakan Privasi
    </NuxtLink>
    BekasKu.
  </p>
</template>

