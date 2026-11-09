<script setup lang="ts">
import { Truck, CheckCircle2 } from 'lucide-vue-next'
import { resolveCourierLogo } from '~/utils/courier'

const props = defineProps<{
  modelValue: boolean
  courierName?: string
  courierLogo?: string
  serviceName?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm'): void
}>()

const resolvedCourierLogo = computed(() => {
  return resolveCourierLogo(props.courierName, props.courierLogo)
})

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
      @click="handleClose"
    >
      <div
        class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-xl"
        @click.stop
      >
        <div class="w-10 h-1 bg-border rounded-full mx-auto mb-4 sm:hidden"></div>

        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Truck class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-outfit font-bold text-base text-text">
              Permintaan Penjemputan Paket
            </h3>
            <p class="font-outfit text-xs text-text-muted">
              Kurir akan menjemput paket ke alamat Anda
            </p>
          </div>
        </div>

        <!-- Courier info card -->
        <div class="p-3 bg-surface-2 rounded-xl border border-border flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-white p-1 border border-border/60 flex items-center justify-center shrink-0">
            <img
              v-if="resolvedCourierLogo"
              :src="resolvedCourierLogo"
              :alt="courierName || 'Kurir'"
              class="w-full h-full object-contain"
            />
            <Truck v-else class="w-5 h-5 text-text-muted" />
          </div>
          <div>
            <div class="font-outfit font-semibold text-sm text-text">
              {{ courierName || 'Kurir' }}
            </div>
            <div v-if="serviceName" class="font-outfit text-xs text-text-muted">
              {{ serviceName }}
            </div>
          </div>
        </div>

        <!-- Instructions Checklist -->
        <div class="space-y-2 mb-5 text-xs font-outfit text-text-muted">
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Kemas produk dengan aman dan rapi sebelum kurir tiba.</span>
          </div>
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Tuliskan atau tempel nomor resi secara jelas di luar paket.</span>
          </div>
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Jangan membayar biaya pengiriman apapun kepada kurir (Cashless).</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            :disabled="loading"
            class="flex-1 h-11 rounded-xl border border-border font-outfit font-semibold text-xs text-text hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-50"
            @click="handleClose"
          >
            Batal
          </button>
          <button
            type="button"
            :disabled="loading"
            class="flex-1 h-11 rounded-xl bg-primary hover:bg-primary-dark font-outfit font-semibold text-xs text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            @click="emit('confirm')"
          >
            <span>Ajukan Penjemputan</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

