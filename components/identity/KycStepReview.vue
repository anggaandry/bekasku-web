<script setup lang="ts">
import { RefreshCw, Loader2, AlertCircle } from 'lucide-vue-next'
import type { IdentityDocType } from '~/types/identity'

const name = defineModel<string>('name', { required: true })
const number = defineModel<string>('number', { required: true })

const props = defineProps<{
  docType: IdentityDocType
  capturedImage: string
  errorMessage: string
  isSubmitting: boolean
}>()

defineEmits<{
  (e: 'retake'): void
  (e: 'submit'): void
}>()

const isKtp = computed(() => props.docType === 'KTP')
</script>

<template>
  <div class="p-5 sm:p-6 pb-6 sm:pb-7 space-y-4">
    <div class="space-y-1">
      <h3 class="text-base sm:text-lg font-bold text-text">
        Cek Data Kamu
      </h3>
      <p class="text-xs text-text-muted leading-relaxed">
        Kami sudah membaca data dari ID kamu. Pastikan semua informasi sudah sesuai sebelum lanjut.
      </p>
    </div>

    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-text">Foto Kartu Identitas</span>
        <button
          type="button"
          class="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
          @click="$emit('retake')"
        >
          <RefreshCw class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Foto Ulang</span>
        </button>
      </div>
      <div class="w-full h-36 sm:h-40 rounded-2xl overflow-hidden border border-border bg-surface-2 flex items-center justify-center shadow-2xs">
        <img
          v-if="capturedImage"
          :src="capturedImage"
          alt="Pratinjau Kartu Identitas"
          width="320"
          height="160"
          class="w-full h-full object-contain"
        />
        <p v-else class="p-8 text-center text-text-muted text-xs">
          Foto belum tersedia
        </p>
      </div>
    </div>

    <div class="space-y-1.5">
      <label for="kyc-name" class="block text-xs font-bold text-text">
        Nama Identitas <span class="text-primary">*</span>
      </label>
      <input
        id="kyc-name"
        v-model="name"
        type="text"
        autocomplete="name"
        placeholder="Masukkan nama sesuai kartu identitas"
        class="w-full h-11 px-3.5 rounded-xl border border-border bg-white text-xs sm:text-sm font-semibold text-text focus:outline-hidden focus:border-primary transition-colors"
      />
    </div>

    <div class="space-y-1.5">
      <label for="kyc-number" class="block text-xs font-bold text-text">
        {{ isKtp ? 'NIK' : 'Nomor SIM' }} <span class="text-primary">*</span>
      </label>
      <input
        id="kyc-number"
        v-model="number"
        type="text"
        :inputmode="isKtp ? 'numeric' : 'text'"
        :maxlength="isKtp ? 16 : 20"
        :placeholder="isKtp ? 'Contoh: 3201234567890001 (16 digit)' : 'Nomor SIM Anda'"
        class="w-full h-11 px-3.5 rounded-xl border border-border bg-white text-xs sm:text-sm font-mono tracking-wider font-semibold text-text focus:outline-hidden focus:border-primary transition-colors"
      />
      <p v-if="isKtp" class="text-[11px] text-text-muted">
        Wajib 16 digit angka sesuai KTP Anda.
      </p>
    </div>

    <div
      v-if="errorMessage"
      class="p-3 rounded-xl bg-danger/10 border border-danger/25 text-xs text-danger font-medium flex items-start gap-2"
      role="alert"
    >
      <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span>{{ errorMessage }}</span>
    </div>

    <div class="pt-2">
      <button
        type="button"
        :disabled="isSubmitting"
        class="w-full h-12 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        @click="$emit('submit')"
      >
        <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" aria-hidden="true" />
        <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}</span>
      </button>
    </div>
  </div>
</template>

