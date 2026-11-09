<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}

const mechanisms = [
  '1 Siklus best deal adalah 12 jam',
  '1 Siklus best deal hanya memiliki kuota maksimal 30 iklan',
  'Pendaftaran best deal dilakukan sebelum siklus best deal berikutnya dimulai',
  'Jika kuota best deal berikutnya sudah terpenuhi, maka penjual tidak bisa mendaftarkan iklannya ke best deal dan harus menunggu sampai kuota pada siklus best deal berikutnya tersedia, begitu seterusnya.',
]
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain transition-opacity font-outfit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bd-info-title"
      @click.self="close"
    >
      <div
        class="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
      >
        <!-- Mobile drag handle -->
        <div class="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div class="w-10 h-1 rounded-full bg-border-light" />
        </div>

        <!-- Header -->
        <div class="px-5 pt-3 sm:pt-5 pb-3 border-b border-border-light/70 flex items-center justify-between shrink-0">
          <h2 id="bd-info-title" class="text-base sm:text-lg font-bold text-text">
            Apa itu BEST DEAL?
          </h2>

          <button
            type="button"
            class="p-1.5 -mr-1 text-text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Tutup"
            @click="close"
          >
            <X class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-text leading-relaxed">
          <div class="p-4 sm:p-5 rounded-2xl bg-surface-2 border border-border-light space-y-4">
            <p class="text-text leading-relaxed">
              <strong>BEST DEAL</strong> adalah penawaran harga terbaik yang diberikan oleh penjual kepada calon pembeli dalam jangka waktu tertentu.
            </p>
            <p class="text-text-muted leading-relaxed">
              Keuntungan mengikuti <strong>BEST DEAL</strong> bagi penjual adalah iklan akan selalu muncul di setiap halaman rekomendasi dan menjadi iklan teratas di setiap halaman pencarian, sehingga iklan akan lebih banyak dilihat oleh calon pembeli.
            </p>

            <div class="pt-2 border-t border-border-light/80">
              <h3 class="text-xs sm:text-sm font-bold text-text uppercase tracking-wider mb-3">
                Mekanisme Best Deal:
              </h3>

              <ul class="space-y-3">
                <li
                  v-for="(item, idx) in mechanisms"
                  :key="idx"
                  class="flex items-start gap-2.5 text-xs sm:text-sm text-text leading-relaxed"
                >
                  <span class="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 sm:p-5 border-t border-border-light bg-surface-1 shrink-0">
          <button
            type="button"
            class="w-full py-3 px-5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            @click="close"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

