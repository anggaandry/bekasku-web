<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Check } from 'lucide-vue-next'
import type { PromotionType, PromotionPackage } from '~/types/promotion'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  modelValue: boolean
  type: PromotionType | ''
  packages: PromotionPackage[]
  currentSelected: PromotionPackage | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'select-package', pkg: PromotionPackage): void
}>()

const tempSelected = ref<PromotionPackage | null>(props.currentSelected)

watch(
  () => props.currentSelected,
  (val) => {
    tempSelected.value = val
  }
)

const filteredPackages = computed(() => {
  if (!props.type) return []
  return props.packages
    .filter((p) => p.type === props.type)
    .sort((a, b) => (a.price || 0) - (b.price || 0))
})

const typeTitle = computed(() => {
  if (!props.type) return ''
  return props.type.charAt(0).toUpperCase() + props.type.slice(1)
})

function onSelect(pkg: PromotionPackage) {
  tempSelected.value = pkg
}

function onConfirm() {
  if (tempSelected.value) {
    emit('select-package', tempSelected.value)
    emit('update:modelValue', false)
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      @click.self="emit('update:modelValue', false)"
    >
      <div
        class="bg-white rounded-t-3xl sm:rounded-3xl border border-border w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-border-light">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text-muted hover:text-text transition-colors"
              @click="emit('update:modelValue', false)"
            >
              <X class="w-4 h-4" />
            </button>
            <h3 class="text-base font-bold font-outfit text-text">
              Beli Fitur {{ typeTitle }}
            </h3>
          </div>
        </div>

        <!-- Package List -->
        <div v-if="filteredPackages.length === 0" class="text-center py-8 text-xs text-text-muted">
          Tidak ada paket tersedia untuk fitur ini.
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="pkg in filteredPackages"
            :key="pkg._id"
            class="flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer"
            :class="[
              tempSelected?._id === pkg._id
                ? 'border-primary bg-primary/5 shadow-2xs'
                : 'border-border-light hover:border-border hover:bg-surface-2/60'
            ]"
            @click="onSelect(pkg)"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm font-semibold text-text font-outfit">
                  {{ pkg.name || `${pkg.quota || 1}x ${typeTitle} (${pkg.days || 7} Hari)` }}
                </span>
                <span
                  v-if="(pkg.discount || 0) > 0"
                  class="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md"
                >
                  Hemat {{ pkg.discount }}%
                </span>
              </div>

              <!-- Price Row -->
              <div class="flex items-baseline gap-2 mt-1">
                <div class="text-sm font-bold text-primary font-outfit">
                  {{ formatRupiah(pkg.price) }}
                </div>
                <div
                  v-if="(pkg.discount || 0) > 0 && pkg.final_price && pkg.final_price > pkg.price"
                  class="text-xs text-text-muted line-through"
                >
                  {{ formatRupiah(pkg.final_price) }}
                </div>
              </div>
            </div>

            <!-- Radio Indicator -->
            <div class="shrink-0 pl-2">
              <div
                class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
                :class="[
                  tempSelected?._id === pkg._id
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-white'
                ]"
              >
                <div
                  v-if="tempSelected?._id === pkg._id"
                  class="w-2 h-2 rounded-full bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Action CTA Button -->
        <div class="pt-3 border-t border-border-light">
          <button
            type="button"
            :disabled="!tempSelected"
            class="w-full py-3 bg-primary text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs"
            @click="onConfirm"
          >
            Pasang Paket
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

