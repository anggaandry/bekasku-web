<script setup lang="ts">
import { X, ChevronRight, Truck } from 'lucide-vue-next'
import type { CheckoutDraftSeller, CheckoutAddress, ShippingServiceItem, CourierRateGroup } from '~/types/checkout'
import { useCheckout } from '~/composables/useCheckout'
import { useFormat } from '~/composables/useFormat'
import { sanitizeMediaUrl } from '~/utils/media'

const { formatPrice } = useFormat()
const { fetchCourierRatesStreaming } = useCheckout()

const props = defineProps<{
  modelValue: boolean
  seller: CheckoutDraftSeller | null
  address: CheckoutAddress | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  select: [shipping: ShippingServiceItem]
}>()

const loading = ref(false)
const serviceLoading = ref(false)
const errorMessage = ref('')
const courierGroups = ref<CourierRateGroup[]>([])

watch(
  () => props.modelValue,
  async (open) => {
    if (open && props.seller && props.address) {
      await loadShippingRates()
    } else {
      courierGroups.value = []
      errorMessage.value = ''
    }
  }
)

async function loadShippingRates() {
  if (!props.seller || !props.address) return
  loading.value = true
  serviceLoading.value = true
  errorMessage.value = ''
  courierGroups.value = []

  try {
    const res = await fetchCourierRatesStreaming(
      props.seller,
      props.address,
      (updatedGroups) => {
        loading.value = false
        courierGroups.value = updatedGroups
      }
    )
    if (res.errorMessage) {
      errorMessage.value = res.errorMessage
    }
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat opsi pengiriman.'
  } finally {
    loading.value = false
    serviceLoading.value = false
  }
}

function handleChoose(item: ShippingServiceItem) {
  emit('select', item)
  emit('update:modelValue', false)
}

function close() {
  emit('update:modelValue', false)
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
          <!-- Header Modal: Sesuai Layar 3 "Pilih Pengiriman" -->
          <div class="px-5 py-4 border-b border-border flex items-center justify-between shrink-0 bg-white">
            <h3 class="text-base font-bold text-text font-outfit">
              Pilih Pengiriman
            </h3>
            <button
              type="button"
              class="p-1.5 rounded-full hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer"
              @click="close"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body List Kurir & Layanan -->
          <div class="p-4 sm:p-5 overflow-y-auto flex-1 bg-surface-2/30">
            <!-- Loading Awal Shimmer Sesuai Mobile V3 (Muncul skeleton shimmer 2 kolom) -->
            <div v-if="loading && courierGroups.length === 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="i in 4"
                :key="i"
                class="rounded-2xl border border-border bg-white overflow-hidden space-y-3 animate-pulse shadow-2xs"
              >
                <div class="p-4 bg-surface-2 flex items-center justify-between border-b border-border/60">
                  <div class="h-4 bg-muted rounded w-1/3" />
                  <div class="w-12 h-5 bg-muted rounded" />
                </div>
                <div class="p-4 space-y-3">
                  <div class="h-3.5 bg-surface-2 rounded w-3/4" />
                  <div class="h-3 bg-surface-2 rounded w-1/2" />
                </div>
              </div>
            </div>

            <!-- Error State -->
            <div v-else-if="errorMessage && courierGroups.length === 0" class="py-12 text-center px-4 bg-white rounded-2xl border border-border">
              <p class="text-xs text-danger mb-4">{{ errorMessage }}</p>
              <button
                type="button"
                class="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors cursor-pointer shadow-xs"
                @click="loadShippingRates"
              >
                Coba Lagi
              </button>
            </div>

            <!-- List Grup Kurir (Maks 2 kolom di Desktop md+, 1 kolom di Mobile) -->
            <div v-else class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="group in courierGroups"
                  :key="group.courier_code"
                  class="rounded-2xl border border-border bg-white overflow-hidden shadow-2xs hover:border-primary/40 transition-colors flex flex-col"
                >
                  <!-- Header Kurir: Nama di kiri, Logo di kanan (Sesuai Mobile V3) -->
                  <div class="px-4 py-3 bg-surface-2/50 border-b border-border/70 flex items-center justify-between">
                    <span class="text-xs sm:text-sm font-bold text-text font-outfit">
                      {{ group.name }}
                    </span>
                    <div class="h-6 flex items-center justify-end">
                      <img
                        v-if="group.logo"
                        :src="sanitizeMediaUrl(group.logo, '')"
                        :alt="group.name"
                        width="80"
                        height="24"
                        class="max-h-6 max-w-[80px] object-contain"
                      />
                      <Truck v-else class="w-4 h-4 text-text-muted" />
                    </div>
                  </div>

                  <!-- Daftar Layanan dari Kurir ini -->
                  <div class="divide-y divide-border/60 flex-1">
                    <div
                      v-for="(service, sIdx) in group.services"
                      :key="`${group.courier_code}_${sIdx}`"
                      class="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-2/60 transition-colors cursor-pointer group"
                      @click="handleChoose(service)"
                    >
                      <div class="min-w-0 pr-2">
                        <h4 class="text-xs sm:text-sm font-semibold text-text group-hover:text-primary transition-colors">
                          {{ service.service_name }}
                        </h4>
                        <p v-if="service.est" class="text-[11px] sm:text-xs text-text-muted mt-0.5">
                          {{ service.est.toLowerCase().includes('hari') || service.est.toLowerCase().includes('day') || service.est.toLowerCase().includes('hour') ? service.est : `${service.est} hari` }}
                        </p>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        <span class="text-xs sm:text-sm font-bold text-text tabular-nums">
                          {{ formatPrice(service.price || 0) }}
                        </span>
                        <ChevronRight class="w-4 h-4 text-text-subtle group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Shimmer saat kurir lain masih streaming dimuat -->
                <template v-if="serviceLoading">
                  <div
                    v-for="s in 2"
                    :key="`shimmer_group_${s}`"
                    class="rounded-2xl border border-border/70 bg-white/70 overflow-hidden space-y-3 animate-pulse"
                  >
                    <div class="p-3 bg-surface-2/60 flex items-center justify-between border-b border-border/50">
                      <div class="h-4 bg-muted rounded w-1/3" />
                      <div class="w-12 h-5 bg-muted rounded" />
                    </div>
                    <div class="p-4 space-y-2.5">
                      <div class="h-3.5 bg-surface-2 rounded w-3/4" />
                      <div class="h-3 bg-surface-2 rounded w-1/2" />
                    </div>
                  </div>
                </template>
              </div>

              <!-- Indikator Loading di Bawah jika masih menghitung kurir lainnya -->
              <div v-if="serviceLoading && courierGroups.length > 0" class="pt-2 pb-1 flex items-center justify-center gap-2 text-xs text-text-muted">
                <div class="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Memeriksa tarif kurir lainnya...</span>
              </div>
            </div>
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
