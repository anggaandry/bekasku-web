<script setup lang="ts">
import { X, ChevronRight, Check } from 'lucide-vue-next'
import type { PaymentCategoryItem, PaymentMethodItem } from '~/types/checkout'
import { sanitizeMediaUrl } from '~/utils/media'

const props = defineProps<{
  modelValue: boolean
  categories: PaymentCategoryItem[]
  selectedMethod: PaymentMethodItem | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  select: [method: PaymentMethodItem]
}>()

function close() {
  emit('update:modelValue', false)
}

function handleSelect(method: PaymentMethodItem) {
  emit('select', method)
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="props.modelValue"
        class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 font-outfit overscroll-contain"
        @click.self="close"
      >
        <div class="w-full max-w-md md:max-w-4xl bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl border border-border overflow-hidden">
          <!-- Header Modal: Sesuai Layar 5 "Pilih Pembayaran" -->
          <div class="px-5 py-4 border-b border-border flex items-center justify-between shrink-0 bg-white">
            <h3 class="text-base font-bold text-text font-outfit">
              Pilih Pembayaran
            </h3>
            <button
              type="button"
              class="p-1.5 rounded-full hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer"
              @click="close"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body Kategori & Metode Pembayaran -->
          <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-6 bg-surface-2/30">
            <!-- Loading State -->
            <div v-if="props.loading" class="py-12 flex flex-col items-center justify-center gap-3">
              <div class="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p class="text-xs text-text-muted font-medium">Memuat metode pembayaran...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="props.categories.length === 0" class="py-12 text-center text-text-muted text-xs bg-white rounded-2xl border border-border">
              Tidak ada metode pembayaran yang tersedia untuk nominal ini.
            </div>

            <!-- List Kategori (QRIS, Cashless, Virtual Account) -->
            <template v-else>
              <div
                v-for="cat in props.categories"
                :key="cat.id"
                class="space-y-2.5"
              >
                <!-- Judul Kategori (Huruf tebal lembut) -->
                <h4 class="text-xs font-bold text-text-muted tracking-wider uppercase px-1">
                  {{ cat.name }}
                </h4>

                <!-- List Metode Pembayaran di Kategori ini: 2 Kolom di Desktop (md:grid-cols-2), 1 Kolom di Mobile -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    v-for="method in cat.methods"
                    :key="method.id"
                    class="p-3.5 sm:p-4 rounded-2xl border border-border bg-white flex items-center justify-between gap-3 cursor-pointer group hover:border-primary/50 hover:shadow-2xs transition-all select-none"
                    :class="{ 'border-primary ring-1 ring-primary/20 bg-primary/5': props.selectedMethod?.id === method.id }"
                    @click="handleSelect(method)"
                  >
                    <!-- Logo + Nama Metode -->
                    <div class="flex items-center gap-3.5 min-w-0">
                      <div class="w-14 h-9 rounded-lg border border-border bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                        <img
                          v-if="method.image"
                          :src="sanitizeMediaUrl(method.image, '')"
                          :alt="method.name"
                          width="48"
                          height="28"
                          class="max-w-full max-h-full object-contain"
                        />
                        <span v-else class="text-[10px] font-bold text-text">
                          {{ method.name }}
                        </span>
                      </div>

                      <div class="min-w-0">
                        <span class="text-xs sm:text-sm font-semibold text-text truncate block group-hover:text-primary transition-colors">
                          {{ method.name }}
                        </span>
                        <span v-if="method.fee_text" class="text-[11px] text-text-muted block mt-0.5">
                          {{ method.fee_text }}
                        </span>
                      </div>
                    </div>

                    <!-- Indikator Terpilih / Chevron -->
                    <div class="shrink-0">
                      <div
                        v-if="props.selectedMethod?.id === method.id"
                        class="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs"
                      >
                        <Check class="w-3 h-3 stroke-[3]" />
                      </div>
                      <ChevronRight v-else class="w-4 h-4 text-text-subtle group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

