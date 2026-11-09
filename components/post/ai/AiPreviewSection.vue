<script setup lang="ts">
import { computed } from 'vue'
import {
  Sparkles,
  Tag,
  Banknote,
  Layers,
  Weight,
  FileText,
  Pencil,
  ArrowRight,
} from 'lucide-vue-next'
import type { UploadedImage, AiPostAnalysisResult } from '~/types/post'
import { useFormat } from '~/composables/useFormat'
import { formatNumber } from '~/utils/format'

const props = withDefaults(
  defineProps<{
    images: UploadedImage[]
    aiResult: AiPostAnalysisResult
    inModal?: boolean
  }>(),
  {
    inModal: false,
  },
)

const emit = defineEmits<{
  (e: 'retry'): void
  (e: 'continue'): void
}>()

const { formatPrice } = useFormat()

const formattedWeight = computed(() => {
  const gram = props.aiResult.weight ?? 100
  const kg = gram / 1000
  if (kg >= 1000) {
    return `${formatNumber(Math.round(kg))} kg`
  } else if (Number.isInteger(kg)) {
    return `${kg} kg`
  } else {
    return `${kg.toFixed(kg < 1 ? 2 : 1)} kg`
  }
})

const fullCategoryText = computed(() => {
  const cat = props.aiResult.category || ''
  const sub = props.aiResult.subcategory || ''
  if (cat && sub) return `${cat} > ${sub}`
  return sub || cat || 'Umum'
})
</script>

<template>
  <div
    :class="[
      'font-outfit',
      inModal
        ? 'flex flex-col flex-1 overflow-hidden'
        : 'space-y-6 pb-24 md:pb-8',
    ]"
  >
    <div
      :class="[
        inModal
          ? 'overflow-y-auto p-5 sm:p-6 space-y-5 flex-1'
          : 'space-y-6',
      ]"
    >
      <!-- ── 1. Saran dari AI Banner ──────────────────────────────────────── -->
      <div
        :class="[
          inModal ? 'p-4 sm:p-5 rounded-2xl space-y-3' : 'p-5 sm:p-6 rounded-3xl space-y-4',
          'bg-gradient-to-br from-purple-50/80 via-white to-pink-50/50 border border-purple-200/70 shadow-xs',
        ]"
      >
        <div class="flex items-center gap-3">
          <div
            :class="[
              inModal ? 'w-9 h-9' : 'w-10 h-10',
              'rounded-full bg-gradient-to-tr from-primary to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs',
            ]"
          >
            <Sparkles :class="[inModal ? 'w-4 h-4' : 'w-5 h-5']" aria-hidden="true" />
          </div>
          <div>
            <h3 :class="[inModal ? 'text-sm' : 'text-sm sm:text-base', 'font-bold text-text']">
              Saran dari AI
            </h3>
            <p :class="[inModal ? 'text-[11px]' : 'text-xs', 'text-text-muted']">
              Berdasarkan foto yang kamu berikan
            </p>
          </div>
        </div>

        <div
          :class="[
            inModal ? 'p-3.5 rounded-xl' : 'p-4 rounded-2xl',
            'bg-white/90 border border-purple-100 shadow-2xs',
          ]"
        >
          <p class="text-xs sm:text-sm text-text leading-relaxed font-medium">
            {{
              aiResult.message ||
              `Harga pasar wajar untuk ${aiResult.title} diperkirakan ${formatPrice(aiResult.price)}.`
            }}
          </p>
        </div>
      </div>

      <!-- ── 2. Foto Barang ────────────────────────────────────────────────── -->
      <div class="space-y-2.5 sm:space-y-3">
        <h3 :class="[inModal ? 'text-sm' : 'text-sm sm:text-base', 'font-bold text-text']">
          Foto Barang
        </h3>

        <div class="flex items-center gap-3 overflow-x-auto pb-1.5 no-scrollbar">
          <div
            v-for="(img, idx) in images"
            :key="img.id || idx"
            :class="[
              inModal ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-24 h-24 sm:w-28 sm:h-28',
              'rounded-2xl overflow-hidden border border-border-light bg-surface-2 shrink-0 shadow-2xs',
            ]"
          >
            <img
              :src="img.url"
              alt="Foto Produk AI"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <!-- ── 3. Detail Produk Card ─────────────────────────────────────────── -->
      <div class="space-y-2.5 sm:space-y-3">
        <h3 :class="[inModal ? 'text-sm' : 'text-sm sm:text-base', 'font-bold text-text']">
          Detail Produk
        </h3>

        <div
          :class="[
            inModal ? 'rounded-2xl p-4 sm:p-5 space-y-3.5' : 'rounded-3xl p-5 sm:p-6 space-y-4',
            'bg-white border border-border-light shadow-xs divide-y divide-border-light/70',
          ]"
        >
          <!-- Judul Produk -->
          <div class="flex items-start gap-3 sm:gap-3.5 pt-0">
            <div
              :class="[
                inModal ? 'w-7 h-7 rounded-lg' : 'w-8 h-8 rounded-xl',
                'bg-surface-2 text-text-muted flex items-center justify-center shrink-0 mt-0.5',
              ]"
            >
              <Tag :class="[inModal ? 'w-3.5 h-3.5' : 'w-4 h-4']" aria-hidden="true" />
            </div>
            <div class="min-w-0 flex-1">
              <p :class="[inModal ? 'text-[11px]' : 'text-xs', 'text-text-muted']">
                Judul Produk
              </p>
              <p
                :class="[
                  inModal ? 'text-xs sm:text-sm' : 'text-sm sm:text-base',
                  'font-bold text-text mt-0.5 leading-snug',
                ]"
              >
                {{ aiResult.title }}
              </p>
            </div>
          </div>

          <!-- Estimasi Harga -->
          <div :class="[inModal ? 'pt-3' : 'pt-4', 'flex items-start gap-3 sm:gap-3.5']">
            <div
              :class="[
                inModal ? 'w-7 h-7 rounded-lg' : 'w-8 h-8 rounded-xl',
                'bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5',
              ]"
            >
              <Banknote :class="[inModal ? 'w-3.5 h-3.5' : 'w-4 h-4']" aria-hidden="true" />
            </div>
            <div class="min-w-0 flex-1">
              <p :class="[inModal ? 'text-[11px]' : 'text-xs', 'text-text-muted']">
                Estimasi Harga
              </p>
              <p
                :class="[
                  inModal ? 'text-sm sm:text-base' : 'text-base sm:text-lg',
                  'font-bold text-emerald-600 mt-0.5 tracking-tight',
                ]"
              >
                {{ formatPrice(aiResult.price) }}
              </p>
            </div>
          </div>

          <!-- Kategori -->
          <div :class="[inModal ? 'pt-3' : 'pt-4', 'flex items-start gap-3 sm:gap-3.5']">
            <div
              :class="[
                inModal ? 'w-7 h-7 rounded-lg' : 'w-8 h-8 rounded-xl',
                'bg-surface-2 text-text-muted flex items-center justify-center shrink-0 mt-0.5',
              ]"
            >
              <Layers :class="[inModal ? 'w-3.5 h-3.5' : 'w-4 h-4']" aria-hidden="true" />
            </div>
            <div class="min-w-0 flex-1">
              <p :class="[inModal ? 'text-[11px]' : 'text-xs', 'text-text-muted']">
                Kategori
              </p>
              <p
                :class="[
                  inModal ? 'text-xs' : 'text-xs sm:text-sm',
                  'font-semibold text-text mt-0.5',
                ]"
              >
                {{ fullCategoryText }}
              </p>
            </div>
          </div>

          <!-- Berat -->
          <div :class="[inModal ? 'pt-3' : 'pt-4', 'flex items-start gap-3 sm:gap-3.5']">
            <div
              :class="[
                inModal ? 'w-7 h-7 rounded-lg' : 'w-8 h-8 rounded-xl',
                'bg-surface-2 text-text-muted flex items-center justify-center shrink-0 mt-0.5',
              ]"
            >
              <Weight :class="[inModal ? 'w-3.5 h-3.5' : 'w-4 h-4']" aria-hidden="true" />
            </div>
            <div class="min-w-0 flex-1">
              <p :class="[inModal ? 'text-[11px]' : 'text-xs', 'text-text-muted']">
                Berat
              </p>
              <p
                :class="[
                  inModal ? 'text-xs' : 'text-xs sm:text-sm',
                  'font-semibold text-text mt-0.5',
                ]"
              >
                {{ formattedWeight }}
              </p>
            </div>
          </div>

          <!-- Deskripsi -->
          <div :class="[inModal ? 'pt-3' : 'pt-4', 'flex items-start gap-3 sm:gap-3.5']">
            <div
              :class="[
                inModal ? 'w-7 h-7 rounded-lg' : 'w-8 h-8 rounded-xl',
                'bg-surface-2 text-text-muted flex items-center justify-center shrink-0 mt-0.5',
              ]"
            >
              <FileText :class="[inModal ? 'w-3.5 h-3.5' : 'w-4 h-4']" aria-hidden="true" />
            </div>
            <div class="min-w-0 flex-1">
              <p :class="[inModal ? 'text-[11px]' : 'text-xs', 'text-text-muted']">
                Deskripsi
              </p>
              <p
                :class="[
                  inModal ? 'text-xs line-clamp-4' : 'text-xs sm:text-sm',
                  'text-text mt-1 leading-relaxed whitespace-pre-line',
                ]"
              >
                {{ aiResult.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 4. Bottom Action Bar ───────────────────────────────────────────── -->
    <div
      :class="[
        inModal
          ? 'p-4 sm:p-5 border-t border-border-light bg-surface-1 flex items-center gap-3 shrink-0'
          : 'fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-border-light p-4 md:static md:bg-transparent md:border-0 md:p-0 md:pt-4',
      ]"
    >
      <div
        :class="[
          inModal ? 'w-full flex items-center gap-3' : 'max-w-2xl mx-auto flex items-center gap-3',
        ]"
      >
        <!-- Button Perbaiki -->
        <button
          type="button"
          class="flex-1 py-3 px-4 rounded-xl bg-white border border-border-light hover:bg-surface-2 text-text text-xs sm:text-sm font-semibold shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          @click="emit('retry')"
        >
          <Pencil class="w-4 h-4" aria-hidden="true" />
          <span>Perbaiki</span>
        </button>

        <!-- Button Lanjutkan -->
        <button
          type="button"
          class="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          @click="emit('continue')"
        >
          <span>Lanjutkan</span>
          <ArrowRight class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
