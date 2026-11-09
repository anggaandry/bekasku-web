<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity"
      @click.self="$emit('update:modelValue', false)"
    >
      <div
        class="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        <!-- Mobile Handle -->
        <div class="sm:hidden flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <!-- Header -->
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ShoppingBag class="w-5 h-5 text-primary" />
            <h3 class="font-outfit font-bold text-gray-900 text-base sm:text-lg">
              Etalase Produk Live
            </h3>
            <span class="text-xs bg-red-50 text-primary px-2 py-0.5 rounded-full font-bold">
              {{ products.length }}
            </span>
          </div>

          <button
            type="button"
            class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            @click="$emit('update:modelValue', false)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Products List -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 min-h-[250px]">
          <!-- Empty State -->
          <div
            v-if="products.length === 0"
            class="flex flex-col items-center justify-center py-16 text-center text-gray-400"
          >
            <PackageSearch class="w-12 h-12 text-gray-300 stroke-[1.5] mb-2" />
            <p class="text-sm font-semibold text-gray-700">
              Belum Ada Produk di Etalase
            </p>
            <p class="text-xs text-gray-400 mt-0.5 max-w-xs">
              Host belum menyematkan atau membagikan etalase jualan pada sesi live ini.
            </p>
          </div>

          <!-- Product Card Item -->
          <div
            v-else
            v-for="(item, idx) in products"
            :key="item._id"
            class="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-red-200 bg-white hover:bg-red-50/20 transition-all shadow-2xs relative"
          >
            <!-- Index Number Badge -->
            <div class="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-black flex items-center justify-center shrink-0">
              {{ idx + 1 }}
            </div>

            <!-- Image -->
            <div class="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 flex items-center justify-center">
              <img
                v-if="sanitizeMediaUrl(item.image || (item.images && item.images[0]), '')"
                :src="sanitizeMediaUrl(item.image || (item.images && item.images[0]), '')"
                :alt="item.title"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <ShoppingBag v-else class="w-5 h-5 text-gray-300" />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <h4 class="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                {{ item.title }}
              </h4>

              <div class="text-xs sm:text-sm font-black text-primary font-outfit mt-1">
                Rp {{ formatRupiah(item.price || 0) }}
              </div>
            </div>

            <!-- CTA Beli / Lihat -->
            <NuxtLink
              :to="`/product/${item._id}`"
              target="_blank"
              rel="noopener noreferrer"
              class="px-4 py-2 rounded-xl bg-primary hover:bg-red-700 text-white font-bold text-xs transition-transform active:scale-95 shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <span>Beli</span>
              <ExternalLink class="w-3 h-3" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X, ShoppingBag, PackageSearch, ExternalLink } from 'lucide-vue-next'
import type { LiveProductItem } from '~/types/live'
import { sanitizeMediaUrl } from '~/utils/media'
import { formatNumber } from '~/utils/format'

defineProps<{
  modelValue: boolean
  products: LiveProductItem[]
}>()

defineEmits<{
  'update:modelValue': [val: boolean]
}>()

function formatRupiah(num: number): string {
  return formatNumber(num)
}
</script>

