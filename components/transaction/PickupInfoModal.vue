<script setup lang="ts">
import { Truck, Info, X, Loader2 } from 'lucide-vue-next'
import { resolveCourierLogo } from '~/utils/courier'

const props = defineProps<{
  modelValue: boolean
  courierName?: string
  courierLogo?: string
  serviceName?: string
  paymentCategory?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm'): void
}>()

const logoError = ref(false)

const resolvedCourierLogo = computed(() => {
  return resolveCourierLogo(props.courierName || props.serviceName, props.courierLogo)
})

watch(
  () => [props.modelValue, props.courierName, props.courierLogo],
  () => {
    logoError.value = false
  }
)

const displayCourierName = computed(() => {
  const c = (props.courierName || '').trim()
  const s = (props.serviceName || '').trim()
  if (c && s && c.toLowerCase() !== s.toLowerCase()) return `${c} - ${s}`
  return c || s || 'Kurir Pengiriman'
})

function handleClose() {
  if (props.loading) return
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
        class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl pt-3 pb-5 px-5 shadow-xl"
        @click.stop
      >
        <div class="w-10 h-1 bg-border rounded-full mx-auto mb-4 sm:hidden"></div>

        <!-- Header matching bekasku_v3 PickupInfoModal -->
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-outfit font-bold text-lg text-text">
            Informasi Penjemputan
          </h3>
          <button
            type="button"
            class="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Tutup"
            @click="handleClose"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Centered Courier Card matching bekasku_v3 -->
        <div class="w-full p-4 bg-surface-2 rounded-2xl border border-border flex flex-col items-center text-center mb-4">
          <div class="w-24 h-12 mb-3 px-2.5 py-1.5 bg-white rounded-xl border border-border flex items-center justify-center">
            <img
              v-if="resolvedCourierLogo && !logoError"
              :src="resolvedCourierLogo"
              :alt="courierName || 'Logo Kurir'"
              class="w-full h-full object-contain"
              @error="logoError = true"
            />
            <Truck v-else class="w-6 h-6 text-primary" />
          </div>
          <div class="font-outfit font-semibold text-base text-text">
            {{ displayCourierName }}
          </div>
          <div class="font-poppins text-xs text-text-muted mt-1">
            {{ paymentCategory || 'Cashless (Ongkir Dibayar di Aplikasi)' }}
          </div>
        </div>

        <!-- Info Banner matching bekasku_v3 -->
        <div class="p-4 rounded-xl bg-primary/6 flex items-start gap-3 mb-5">
          <Info class="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p class="font-poppins text-[13px] font-medium text-text leading-relaxed">
            Tunggu penjemputan kurir {{ courierName || 'terkait' }} terdekat di kecamatanmu
          </p>
        </div>

        <!-- Full-width Primary Action Button matching bekasku_v3 -->
        <button
          type="button"
          :disabled="loading"
          class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark font-outfit font-semibold text-sm text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
          @click="emit('confirm')"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <span>Ajukan Penjemputan</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>
