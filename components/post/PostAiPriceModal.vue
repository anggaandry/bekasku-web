<script setup lang="ts">
import { Sparkles, Check, X, Loader2 } from 'lucide-vue-next'
import type { AiPriceResult } from '~/types/post'
import { useFormat } from '~/composables/useFormat'

const props = defineProps<{
  modelValue: boolean
  loading?: boolean
  result: AiPriceResult | null
  productTitle: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'apply'): void
  (e: 'retry'): void
}>()

const { formatPrice } = useFormat()

function close() {
  emit('update:modelValue', false)
}

function handleApply() {
  emit('apply')
  close()
}

watch(
  () => props.modelValue,
  (open) => {
    if (import.meta.client) {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (import.meta.client && props.modelValue) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain transition-opacity font-outfit"
      role="dialog"
      aria-modal="true"
      @click.self="close"
    >
      <div
        class="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
      >
        <!-- Modal Header -->
        <div class="px-5 pt-4 pb-3 border-b border-border-light flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-2xs">
              <Sparkles class="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-text">
                Estimasi Harga AI
              </h3>
              <p class="text-[11px] text-text-muted">
                Rekomendasi harga jual pasar cerdas
              </p>
            </div>
          </div>
          <button
            type="button"
            class="p-1.5 -mr-1 text-text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Tutup"
            @click="close"
          >
            <X class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 space-y-4 overflow-y-auto">
          <!-- Loading State -->
          <div v-if="loading" class="py-10 text-center space-y-3">
            <Loader2 class="w-8 h-8 text-primary animate-spin mx-auto" aria-hidden="true" />
            <p class="text-xs text-text-muted">
              AI sedang menganalisis kondisi barang dan harga pasar terkini...
            </p>
          </div>

          <!-- Result State -->
          <template v-else-if="result">
            <div class="p-4 rounded-2xl bg-gradient-to-b from-purple-50/70 to-pink-50/40 border border-purple-200/80 text-center space-y-2">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-semibold">
                <Sparkles class="w-3 h-3" aria-hidden="true" />
                <span>Rekomendasi Harga Jual</span>
              </span>
              <p class="text-2xl sm:text-3xl font-bold text-text tracking-tight font-outfit">
                {{ formatPrice(result.price) }}
              </p>
              <p class="text-xs text-text-muted">
                Untuk barang: <strong class="text-text">{{ productTitle }}</strong>
              </p>
            </div>

            <!-- AI Insight Note -->
            <div class="p-4 rounded-2xl bg-surface-2 border border-border-light space-y-1.5">
              <p class="text-xs font-bold text-text uppercase tracking-wider">
                Analisis Pasar AI
              </p>
              <p class="text-xs text-text-muted leading-relaxed">
                {{ result.description }}
              </p>
            </div>

            <!-- Actions -->
            <div class="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                class="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                @click="handleApply"
              >
                <Check class="w-4 h-4" aria-hidden="true" />
                <span>Terapkan Harga Ini</span>
              </button>

              <button
                type="button"
                class="py-2.5 px-3 rounded-xl bg-surface-2 hover:bg-border-light border border-border-light text-xs font-semibold text-text transition-colors cursor-pointer"
                @click="emit('retry')"
              >
                Analisis Ulang
              </button>
            </div>
          </template>

          <!-- Error or Empty -->
          <div v-else class="py-8 text-center space-y-3">
            <p class="text-xs text-text-muted">
              Belum ada hasil analisis. Klik tombol di bawah untuk meminta estimasi harga AI.
            </p>
            <button
              type="button"
              class="py-2 px-4 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-hover transition-colors cursor-pointer"
              @click="emit('retry')"
            >
              Minta Estimasi Harga AI
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

