<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

defineProps<{
  title: string
  description: string
  buttonText?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="py-4 flex flex-col items-center text-center">
    <div class="w-28 h-28 rounded-full bg-primary/8 flex items-center justify-center p-4">
      <img
        src="/images/auth/success_mark.png"
        alt="Berhasil"
        width="88"
        height="88"
        class="w-full h-full object-contain"
      />
    </div>

    <h3 class="mt-4 text-lg font-bold text-text font-outfit">
      {{ title }}
    </h3>
    <p class="mt-1.5 text-xs text-text-muted leading-relaxed max-w-xs">
      {{ description }}
    </p>

    <button
      type="button"
      class="mt-6 w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer"
      @click="emit('action')"
    >
      <span>{{ buttonText || 'Lanjutkan Masuk' }}</span>
      <ArrowRight class="w-4 h-4" />
    </button>
  </div>
</template>

