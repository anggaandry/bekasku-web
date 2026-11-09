<script setup lang="ts">
import { TrendingUp, Star, Zap, ChevronRight, Clock, Plus } from 'lucide-vue-next'
import type { ActivePromotionProduct } from '~/types/promotion'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  promotions: ActivePromotionProduct[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'add-promotion'): void
}>()

function getProductImage(img?: string[] | string): string {
  if (Array.isArray(img) && img.length > 0) return img[0]
  if (typeof img === 'string' && img.length > 0) return img
  return '/images/empty-product.png'
}

function formatExpiry(dateStr?: string | null): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatCooldown(seconds?: number): string {
  if (!seconds || seconds <= 0) return 'Siap Sundul'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `Cooldown ${h}j ${m}m`
  return `Cooldown ${m}m`
}
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="props.loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-28 bg-white rounded-2xl border border-border animate-pulse p-4 flex gap-4" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="props.promotions.length === 0"
      class="bg-white rounded-2xl border border-border p-8 text-center max-w-lg mx-auto my-4 space-y-4 shadow-2xs"
    >
      <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
        <TrendingUp class="w-8 h-8" />
      </div>
      <div>
        <h3 class="text-base font-bold font-outfit text-text">
          Belum Ada Promosi Aktif
        </h3>
        <p class="text-xs text-text-muted mt-1 leading-relaxed">
          Promosikan barang Anda sekarang agar menjangkau lebih banyak pembeli potensial dan laku lebih cepat.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-2xs"
        @click="emit('add-promotion')"
      >
        <Plus class="w-4 h-4" />
        Promosikan Barang Sekarang
      </button>
    </div>

    <!-- List of active promotions -->
    <div v-else class="space-y-3">
      <div
        v-for="item in props.promotions"
        :key="item._id"
        class="bg-white rounded-2xl border border-border hover:border-primary/40 transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
      >
        <div class="flex items-start gap-3.5 min-w-0 flex-1">
          <NuxtImg
            :src="getProductImage(item.image)"
            :alt="item.title"
            class="w-16 h-16 rounded-xl object-cover bg-surface-2 shrink-0 border border-border-light"
            width="64"
            height="64"
          />
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-text truncate font-outfit">
              {{ item.title }}
            </h4>
            <div class="text-xs font-bold text-primary mt-0.5">
              {{ formatRupiah(item.price) }}
            </div>

            <!-- Active Feature Badges -->
            <div class="flex flex-wrap items-center gap-1.5 mt-2">
              <span
                v-if="item.highlight_active"
                class="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg"
              >
                <Star class="w-3 h-3 text-amber-600 fill-amber-500" />
                Highlight s.d. {{ formatExpiry(item.highlight_until) }}
              </span>

              <span
                v-if="item.spotlight_active"
                class="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg"
              >
                <Zap class="w-3 h-3 text-indigo-600" />
                Spotlight s.d. {{ formatExpiry(item.spotlight_until) }}
              </span>

              <span
                v-if="item.sundul_active"
                class="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-lg"
              >
                <Clock class="w-3 h-3 text-cyan-600" />
                {{ formatCooldown(item.sundul_cooldown_seconds) }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-light">
          <NuxtLink
            :to="`/seller/promotion/choose?product_id=${item._id}`"
            class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-surface-2 hover:bg-primary/10 text-text hover:text-primary text-xs font-semibold rounded-xl border border-border transition-colors w-full sm:w-auto"
          >
            Kelola Promosi
            <ChevronRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

