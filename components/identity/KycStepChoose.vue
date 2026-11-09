<script setup lang="ts">
import { Contact, CreditCard, ChevronRight } from 'lucide-vue-next'
import type { IdentityDocType } from '~/types/identity'

defineEmits<{
  (e: 'select', type: IdentityDocType): void
}>()
</script>

<template>
  <div class="p-6 sm:p-7 space-y-4">
    <div class="space-y-1 mb-4">
      <h3 class="text-base sm:text-lg font-bold text-text">
        Pilih Jenis Dokumen
      </h3>
      <p class="text-xs text-text-muted">
        Pilih salah satu kartu identitas resmi Anda yang masih berlaku
      </p>
    </div>

    <button
      type="button"
      class="w-full p-4 rounded-2xl border border-border hover:border-primary/60 bg-white hover:bg-surface-2 flex items-center justify-between gap-3 text-left transition-all cursor-pointer shadow-2xs group"
      @click="$emit('select', 'KTP')"
    >
      <div class="flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Contact class="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-text group-hover:text-primary transition-colors">
            KTP (Kartu Tanda Penduduk)
          </h4>
          <p class="text-xs text-text-muted mt-0.5">
            Direkomendasikan untuk verifikasi resmi
          </p>
        </div>
      </div>
      <ChevronRight class="w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0" aria-hidden="true" />
    </button>

    <button
      type="button"
      class="w-full p-4 rounded-2xl border border-border hover:border-primary/60 bg-white hover:bg-surface-2 flex items-center justify-between gap-3 text-left transition-all cursor-pointer shadow-2xs group"
      @click="$emit('select', 'SIM')"
    >
      <div class="flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-info-soft text-info flex items-center justify-center shrink-0">
          <CreditCard class="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-text group-hover:text-primary transition-colors">
            SIM (Surat Izin Mengemudi)
          </h4>
          <p class="text-xs text-text-muted mt-0.5">
            Gunakan SIM A / C aktif
          </p>
        </div>
      </div>
      <ChevronRight class="w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0" aria-hidden="true" />
    </button>
  </div>
</template>

