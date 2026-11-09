<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="mb-6">
    <h2 class="text-xl sm:text-2xl font-bold text-text font-outfit leading-tight tracking-tight">
      {{ title }}
    </h2>
    <p v-if="subtitle" class="mt-1.5 text-xs sm:text-[13px] text-text-muted leading-relaxed">
      {{ subtitle }}
    </p>
  </div>
</template>
