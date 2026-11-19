<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X } from 'lucide-vue-next'
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
  () => [props.modelValue, props.currentSelected] as const,
  ([open, val]) => {
    if (open) {
      tempSelected.value = val || filteredPackages.value[0] || null
    }
  }
)

const filteredPackages = computed(() => {
  if (!props.type) return []
  return props.packages
    .filter((p) => p.type === props.type)
    .sort((a, b) => (b.price || 0) - (a.price || 0))
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
        class="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-4 sm:p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <!-- Modal Header -->
        <div class="flex items-center gap-3 pb-1">
          <button
            type="button"
            class="p-1 -ml-1 text-gray-800 hover:text-primary transition-colors cursor-pointer"
            aria-label="Tutup"
            @click="emit('update:modelValue', false)"
          >
            <X class="w-5 h-5" />
          </button>
          <h3 class="text-base font-bold font-outfit text-gray-900">
            Beli Fitur {{ typeTitle }}
          </h3>
        </div>

        <!-- Package List -->
        <div v-if="filteredPackages.length === 0" class="text-center py-8 text-xs text-gray-500">
          Tidak ada paket tersedia untuk fitur ini.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="pkg in filteredPackages"
            :key="pkg._id"
            class="p-4 rounded-xl border transition-all cursor-pointer"
            :class="[
              tempSelected?._id === pkg._id
                ? 'border-primary bg-[#FFF5F5]'
                : 'border-gray-200 bg-white hover:border-gray-300'
            ]"
            @click="onSelect(pkg)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <h4 class="text-sm font-bold text-gray-900 font-outfit">
                  {{ pkg.name || `Fitur ${typeTitle}` }}
                </h4>
                <p class="text-xs text-gray-500 mt-1 leading-relaxed">
                  {{ pkg.description || 'Dapatkan s.d. 2x lebih banyak calon pembeli' }}
                </p>
              </div>

              <!-- Radio Circle -->
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                :class="tempSelected?._id === pkg._id ? 'border-primary' : 'border-gray-300'"
              >
                <div v-if="tempSelected?._id === pkg._id" class="w-2.5 h-2.5 rounded-full bg-primary" />
              </div>
            </div>

            <!-- Price & Validity Row -->
            <div class="flex items-center justify-between gap-2 mt-3">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-gray-900 font-outfit">
                  {{ formatRupiah(pkg.price) }}
                </span>
                <span
                  v-if="(pkg.discount || 0) > 0 && pkg.final_price && pkg.final_price > pkg.price"
                  class="text-xs text-gray-400 line-through"
                >
                  {{ formatRupiah(pkg.final_price) }}
                </span>
                <span
                  v-if="(pkg.discount || 0) > 0"
                  class="text-[10px] font-bold text-primary bg-[#FCE8EA] px-1.5 py-0.5 rounded"
                >
                  {{ pkg.discount }}%
                </span>
              </div>

              <span class="text-xs font-medium text-gray-700 shrink-0">
                Masa Berlaku: {{ pkg.days || 30 }} hari
              </span>
            </div>
          </div>
        </div>

        <!-- Bottom CTA -->
        <button
          type="button"
          :disabled="!tempSelected"
          class="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-45 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors cursor-pointer"
          @click="onConfirm"
        >
          Pasang
        </button>
      </div>
    </div>
  </Teleport>
</template>
