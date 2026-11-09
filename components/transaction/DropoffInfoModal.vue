<script setup lang="ts">
import { Store, Copy, Check, CheckCircle2, Printer } from 'lucide-vue-next'
import { resolveCourierLogo } from '~/utils/courier'

const props = defineProps<{
  modelValue: boolean
  courierName?: string
  courierLogo?: string
  serviceName?: string
  waybill?: string
  showConfirmButton?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm'): void
  (e: 'print'): void
}>()

const copied = ref(false)

const resolvedCourierLogo = computed(() => {
  return resolveCourierLogo(props.courierName, props.courierLogo)
})

function handleClose() {
  emit('update:modelValue', false)
}

function copyWaybill() {
  if (!props.waybill) return
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(props.waybill)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
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
          <div class="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <Store class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-outfit font-bold text-base text-text">
              Antar ke Counter (Drop Off)
            </h3>
            <p class="font-outfit text-xs text-text-muted">
              Serahkan paket secara mandiri ke gerai terdekat
            </p>
          </div>
        </div>

        <!-- Courier Card -->
        <div class="p-3 bg-surface-2 rounded-xl border border-border flex items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-white p-1 border border-border/60 flex items-center justify-center shrink-0">
              <img
                v-if="resolvedCourierLogo"
                :src="resolvedCourierLogo"
                :alt="courierName || 'Kurir'"
                class="w-full h-full object-contain"
              />
              <Store v-else class="w-5 h-5 text-text-muted" />
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

          <div v-if="waybill" class="text-right">
            <div class="text-[10px] font-outfit text-text-muted">No. Resi</div>
            <div class="inline-flex items-center gap-1 font-outfit font-bold text-xs text-text">
              <span>{{ waybill }}</span>
              <button
                type="button"
                class="p-0.5 rounded hover:bg-white text-text-muted hover:text-text cursor-pointer transition-colors"
                @click="copyWaybill"
              >
                <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-600" />
                <Copy v-else class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="space-y-2 mb-5 text-xs font-outfit text-text-muted">
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Kunjungi counter atau gerai {{ courierName }} terdekat di kota Anda.</span>
          </div>
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Tunjukkan nomor resi di atas kepada petugas counter.</span>
          </div>
          <div class="flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Layanan bersifat Cashless — Anda tidak perlu membayar ongkir di counter.</span>
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
            Tutup
          </button>

          <button
            v-if="waybill"
            type="button"
            :disabled="loading"
            class="flex-1 h-11 rounded-xl border border-primary text-primary hover:bg-primary/5 font-outfit font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            @click="emit('print')"
          >
            <Printer class="w-4 h-4" />
            <span>Cetak Resi</span>
          </button>

          <button
            v-if="showConfirmButton"
            type="button"
            :disabled="loading"
            class="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 font-outfit font-semibold text-xs text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            @click="emit('confirm')"
          >
            <span>Alihkan ke Drop Off</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

