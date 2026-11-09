<script setup lang="ts">
import { ref, computed } from 'vue'
import { Truck, X } from 'lucide-vue-next'
import type { ShippingServiceItem } from '~/types/product'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  services: ShippingServiceItem[]
  city?: string
  freeDeliveryAmount?: number
}>()

const isModalOpen = ref(false)
const displayServices = computed(() => props.services.slice(0, 3))
const discount = computed(() => Number(props.freeDeliveryAmount || 0))
</script>

<template>
  <div v-if="services.length > 0" class="space-y-2.5">
    <div class="text-xs font-medium text-text-muted">
      Estimasi Kurir Dikirim ke <span class="font-semibold text-text">{{ city || 'Kota Tujuan' }}</span>
    </div>

    <div class="divide-y divide-border/50">
      <div
        v-for="(s, idx) in displayServices"
        :key="idx"
        class="py-2.5 flex items-center gap-3"
      >
        <img
          v-if="s.logo"
          :src="s.logo"
          :alt="s.carrier"
          class="w-8 h-8 object-contain shrink-0"
        />
        <div v-else class="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 text-text-muted">
          <Truck class="w-4 h-4" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="text-xs sm:text-sm font-medium text-text truncate">
            {{ s.carrier }} - {{ s.description }}
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <span v-if="discount > 0" class="text-text-muted line-through">
              {{ formatRupiah(s.price) }}
            </span>
            <span class="font-bold text-text">
              {{ discount >= s.price ? 'Gratis' : formatRupiah(s.price - discount) }}
            </span>
            <span class="text-text-muted">• {{ s.est }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="services.length > 3" class="text-center pt-1">
      <button
        type="button"
        @click="isModalOpen = true"
        class="text-xs sm:text-sm font-bold text-primary hover:underline cursor-pointer"
      >
        Lihat Semua ({{ services.length - 3 }})
      </button>
    </div>

    <!-- All Delivery Modal -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
        @click="isModalOpen = false"
      >
        <div
          class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-xl max-h-[75vh] flex flex-col"
          @click.stop
        >
          <div class="flex items-center justify-between border-b border-border pb-3">
            <h3 class="text-base font-bold text-text">Pilihan Pengiriman</h3>
            <button
              type="button"
              @click="isModalOpen = false"
              class="p-1 rounded-full hover:bg-surface-2 text-text cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto divide-y divide-border/50">
            <div
              v-for="(s, idx) in services"
              :key="idx"
              class="py-3 flex items-center gap-3"
            >
              <img
                v-if="s.logo"
                :src="s.logo"
                :alt="s.carrier"
                class="w-8 h-8 object-contain shrink-0"
              />
              <div v-else class="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 text-text-muted">
                <Truck class="w-4 h-4" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-text">
                  {{ s.carrier }} - {{ s.description }}
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <span v-if="discount > 0" class="text-text-muted line-through">
                    {{ formatRupiah(s.price) }}
                  </span>
                  <span class="font-bold text-text">
                    {{ discount >= s.price ? 'Gratis' : formatRupiah(s.price - discount) }}
                  </span>
                  <span class="text-text-muted">• {{ s.est }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

