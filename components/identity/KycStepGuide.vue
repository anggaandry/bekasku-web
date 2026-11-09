<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { IdentityDocType } from '~/types/identity'

const props = defineProps<{
  docType: IdentityDocType
}>()

defineEmits<{
  (e: 'ready'): void
}>()

const requirements = computed(() => [
  'Foto harus terlihat jelas dan terang',
  'Tidak terpotong (semua sudut harus terlihat)',
  `Data di ${props.docType} terbaca dengan jelas`,
  'Tidak ada pantulan cahaya atau bayangan',
])
</script>

<template>
  <div class="p-6 sm:p-7 flex flex-col items-center space-y-6">
    <div class="w-44 sm:w-52 flex items-center justify-center">
      <img
        src="/images/identity/illust_identity_guidelines.png"
        alt="Panduan Foto Identitas"
        width="208"
        height="176"
        class="w-full h-auto object-contain max-h-44"
        loading="eager"
      />
    </div>

    <div class="text-center space-y-1.5 max-w-sm">
      <h3 class="text-lg sm:text-xl font-bold text-text">
        Silahkan Foto Dokumen
      </h3>
      <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
        Ambil foto {{ docType }} kamu untuk proses verifikasi identitas
      </p>
    </div>

    <div class="w-full bg-surface-2 rounded-2xl p-4 sm:p-5 border border-border space-y-3">
      <h4 class="text-xs sm:text-sm font-bold text-text">
        Foto harus memenuhi syarat berikut:
      </h4>
      <ul class="space-y-2.5 text-xs sm:text-sm text-text-muted">
        <li v-for="item in requirements" :key="item" class="flex items-start gap-2.5">
          <Check class="w-4 h-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>

    <div class="w-full pt-1">
      <button
        type="button"
        class="w-full h-12 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all cursor-pointer"
        @click="$emit('ready')"
      >
        Saya siap
      </button>
    </div>
  </div>
</template>

