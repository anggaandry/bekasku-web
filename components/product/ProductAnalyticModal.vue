<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, X, Info } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  step: number // 0: intro, 1: loading, 2: result
  score: number
  recom: string
  description: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'start'): void
}>()

function close() {
  emit('update:modelValue', false)
}

function handleAction() {
  if (props.step !== 0) {
    close()
  } else {
    emit('start')
  }
}

const scoreColorClass = computed(() => {
  if (props.score <= 5) return 'text-danger'
  if (props.score < 8) return 'text-amber-500'
  return 'text-emerald-600'
})

const recomBadgeClass = computed(() => {
  if (props.score <= 5) return 'bg-red-50 text-red-600 border-red-200'
  if (props.score < 8) return 'bg-amber-50 text-amber-600 border-amber-200'
  return 'bg-emerald-50 text-emerald-600 border-emerald-200'
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
      @click="close"
    >
      <div
        class="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl px-5 pt-3 pb-6 shadow-2xl flex flex-col max-h-[85vh]"
        @click.stop
      >
        <!-- Drag handle -->
        <div class="w-12 h-1 rounded-full bg-gray-200 mx-auto mb-4"></div>

        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
            Analisa Postingan dengan AI
          </h3>
          <button
            type="button"
            @click="close"
            class="p-1.5 rounded-full hover:bg-surface-2 text-gray-900 transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto min-h-[280px] flex flex-col">
          <!-- Step 0: Intro -->
          <div
            v-if="step === 0"
            class="flex-1 p-6 rounded-2xl bg-surface-2 border border-border flex flex-col items-center justify-center text-center"
          >
            <div class="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center text-primary mb-6">
              <Sparkles class="w-10 h-10" />
            </div>
            <h4 class="text-lg font-bold text-gray-900 mb-3">
              Analisis Cerdas Siap Membantu!
            </h4>
            <p class="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              AI kami akan menganalisis postingan Anda, mulai dari foto, harga, hingga deskripsi produk. Kami akan memberikan rekomendasi terbaik khusus untuk Anda.
            </p>
            <div class="mt-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-100 text-amber-800 text-xs font-semibold">
              <Info class="w-4 h-4 shrink-0" />
              <span>Fitur ini dapat digunakan sekali sehari</span>
            </div>
          </div>

          <!-- Step 1: Loading -->
          <div
            v-else-if="step === 1"
            class="flex-1 py-16 flex flex-col items-center justify-center text-center"
          >
            <div class="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-6"></div>
            <h4 class="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              AI Sedang Menganalisis...
            </h4>
            <p class="text-xs sm:text-sm text-gray-500">
              Mohon tunggu sebentar, kami sedang memproses data Anda.
            </p>
          </div>

          <!-- Step 2: Result -->
          <div v-else class="space-y-4">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <div class="text-xs font-medium text-slate-500 mb-0.5">Skor Kelayakan</div>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-extrabold tracking-tight" :class="scoreColorClass">{{ score }}</span>
                  <span class="text-sm font-semibold text-slate-400">/10</span>
                </div>
              </div>
              <span
                class="px-3 py-1 rounded-full text-xs font-bold border capitalize"
                :class="recomBadgeClass"
              >
                {{ recom }}
              </span>
            </div>

            <div class="p-4 rounded-2xl bg-white border border-border text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {{ description || 'Postingan sudah cukup baik dan informatif untuk menarik pembeli.' }}
            </div>
          </div>
        </div>

        <!-- CTA Button -->
        <button
          type="button"
          :disabled="step === 1"
          @click="handleAction"
          class="mt-4 w-full h-13 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:opacity-95 text-white font-semibold text-sm sm:text-base flex items-center justify-center transition-opacity cursor-pointer disabled:opacity-50"
        >
          <span class="text-white">{{ step !== 0 ? 'Tutup' : 'Mulai Analisis AI' }}</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

