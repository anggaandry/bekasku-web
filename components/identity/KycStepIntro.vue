<script setup lang="ts">
import { Lock } from 'lucide-vue-next'

const props = defineProps<{
  reason: string
}>()

defineEmits<{
  (e: 'start'): void
  (e: 'skip'): void
}>()

const reasonMessage = computed(() => {
  if (props.reason === 'sell') {
    return 'Verifikasi identitas diperlukan untuk keamanan akun dan membuka fitur jual barang di BekasKu.'
  }
  if (props.reason === 'withdraw' || props.reason === 'bank') {
    return 'Verifikasi KTP diperlukan sebelum Anda dapat mendaftarkan rekening atau mencairkan saldo.'
  }
  return ''
})
</script>

<template>
  <div class="p-6 sm:p-7 flex flex-col items-center text-center space-y-6">
    <div class="w-48 sm:w-56 flex items-center justify-center">
      <img
        src="/images/identity/illust_identity_verification.png"
        alt="Verifikasi Identitas"
        width="224"
        height="192"
        class="w-full h-auto object-contain max-h-48"
        loading="eager"
      />
    </div>

    <div class="space-y-2 max-w-sm">
      <h3 class="text-lg sm:text-xl font-bold text-text">
        Silahkan verifikasi identitas anda
      </h3>
      <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
        Sebelum kamu bisa pakai aplikasi, kita perlu verifikasi identitas dulu ya. Tenang, datamu dienkripsi dan disimpan dengan aman.
      </p>
    </div>

    <div
      v-if="reasonMessage"
      class="p-3 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-primary font-semibold flex items-center gap-2 max-w-sm text-left"
    >
      <Lock class="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{{ reasonMessage }}</span>
    </div>

    <div class="w-full space-y-2.5 pt-2">
      <button
        type="button"
        class="w-full h-12 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all cursor-pointer"
        @click="$emit('start')"
      >
        Verifikasi Sekarang
      </button>
      <button
        type="button"
        class="w-full py-2.5 text-xs sm:text-sm font-semibold text-text-muted hover:text-text transition-colors cursor-pointer"
        @click="$emit('skip')"
      >
        Nanti saja
      </button>
    </div>
  </div>
</template>

