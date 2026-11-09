<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import {
  X,
  CircleHelp,
  Loader2,
  Package,
} from 'lucide-vue-next'
import { useBestDealCreate } from '~/composables/useBestDealCreate'
import { useFormat } from '~/composables/useFormat'
import { sanitizeMediaUrl } from '~/utils/media'
import BestDealInfoModal from '~/components/post/bestdeal/BestDealInfoModal.vue'
import BestDealSuccessModal from '~/components/post/bestdeal/BestDealSuccessModal.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    productId: string
    price?: number
    title?: string
    image?: string
  }>(),
  {
    price: 0,
    title: '',
    image: '',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'success', scheduleDate: string): void
}>()

const { formatPrice } = useFormat()

const {
  productId: hookProductId,
  price: hookPrice,
  discountText,
  discountNum,
  priceBD,
  loading,
  isButtonEnabled,
  setInitialData,
  changeDiscount,
  fetchProductDetail,
  createBestDeal,
} = useBestDealCreate()

const showInfoModal = ref(false)
const showSuccessModal = ref(false)
const successScheduleDate = ref('')

function close() {
  emit('update:modelValue', false)
}

watch(
  () => [props.modelValue, props.productId, props.price],
  async ([open, id, p]) => {
    if (open && id) {
      setInitialData(String(id), Number(p || 0), props.title, props.image)
      if (!p || Number(p) <= 0) {
        await fetchProductDetail(String(id))
      }
    }
  },
  { immediate: true }
)

watch(
  () => [props.modelValue, showInfoModal.value, showSuccessModal.value],
  ([open, infoOpen, successOpen]) => {
    if (import.meta.client) {
      document.body.style.overflow = open || infoOpen || successOpen ? 'hidden' : ''
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (import.meta.client && props.modelValue) {
    document.body.style.overflow = ''
  }
})

function onDiscountInput(event: Event) {
  const target = event.target as HTMLInputElement
  changeDiscount(target.value)
}

async function handleApply() {
  const res = await createBestDeal()
  if (res.success && res.resultDate) {
    successScheduleDate.value = res.resultDate
    showSuccessModal.value = true
    emit('success', res.resultDate)
  }
}

function handleSuccessClose() {
  showSuccessModal.value = false
  close()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain transition-opacity font-outfit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bd-register-modal-title"
      @click.self="close"
    >
      <div
        class="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
      >
        <!-- Mobile drag handle -->
        <div class="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div class="w-10 h-1 rounded-full bg-border-light" />
        </div>

        <!-- ── Modal Header ─────────────────────────────────────────────── -->
        <div class="px-5 pt-3 sm:pt-4 pb-3 border-b border-border-light/70 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <button
              type="button"
              class="p-1.5 -ml-1.5 text-text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Tutup"
              @click="close"
            >
              <X class="w-5 h-5" aria-hidden="true" />
            </button>

            <h2 id="bd-register-modal-title" class="text-base sm:text-lg font-bold text-text uppercase tracking-wide">
              BEST DEAL
            </h2>
          </div>

          <!-- Red Question mark button for Info Modal -->
          <button
            type="button"
            class="p-1.5 -mr-1 rounded-full hover:bg-surface-2 text-primary transition-colors cursor-pointer"
            aria-label="Info Best Deal"
            @click="showInfoModal = true"
          >
            <CircleHelp class="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
          </button>
        </div>

        <!-- ── Modal Body / Form ────────────────────────────────────────── -->
        <div class="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          <!-- Optional Product Card Preview -->
          <div
            v-if="title"
            class="p-3 rounded-2xl bg-surface-2 border border-border-light flex items-center gap-3"
          >
            <div
              class="w-11 h-11 rounded-xl bg-white border border-border-light overflow-hidden shrink-0 flex items-center justify-center"
            >
              <img
                v-if="image"
                :src="sanitizeMediaUrl(image)"
                :alt="title"
                width="44"
                height="44"
                class="w-full h-full object-cover"
              />
              <Package v-else class="w-5 h-5 text-text-subtle" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[11px] text-text-muted font-medium">
                Produk Terpilih
              </p>
              <p class="text-xs sm:text-sm font-bold text-text truncate mt-0.5">
                {{ title }}
              </p>
            </div>
          </div>

          <!-- 1. Harga Awal (Read-only) -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-text-muted">
              Harga Awal
            </label>
            <div
              class="w-full bg-muted border border-border-light rounded-2xl px-4 py-3 text-sm sm:text-base font-medium text-text select-none cursor-not-allowed"
            >
              {{ formatPrice(hookPrice) }}
            </div>
          </div>

          <!-- 2. Diskon Harga (%) -->
          <div class="space-y-1.5">
            <label for="bd-modal-discount-input" class="block text-xs font-semibold text-text-muted">
              Diskon Harga (%)
            </label>
            <div class="relative">
              <input
                id="bd-modal-discount-input"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                :value="discountText"
                placeholder="Masukkan nilai diskon (30-99)"
                class="w-full bg-white border border-border-light rounded-2xl px-4 py-3 text-sm sm:text-base text-text placeholder:text-text-subtle focus:outline-none focus:border-primary transition-all font-medium"
                @input="onDiscountInput"
              />
              <span
                v-if="discountText"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted pointer-events-none"
              >
                %
              </span>
            </div>
            <p
              v-if="discountNum > 0 && discountNum < 30"
              class="text-[11px] font-medium text-primary mt-1"
            >
              Diskon Best Deal minimal 30%.
            </p>
          </div>

          <!-- 3. HARGA BEST DEALS -->
          <div class="pt-1 space-y-1">
            <p class="text-xs font-bold text-text-muted tracking-wider uppercase">
              HARGA BEST DEALS
            </p>
            <div class="py-1.5 border-b border-border">
              <p class="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
                {{ formatPrice(priceBD) }}
              </p>
            </div>
          </div>

          <!-- 4. Notice / Warning Box -->
          <div
            class="p-4 rounded-2xl bg-orange-50 border border-orange-100 text-xs sm:text-sm text-text leading-relaxed shadow-2xs"
          >
            <p>
              Anda tidak dapat melakukan perubahan pada iklan selama program
              <strong class="text-orange-500 font-bold">BEST DEAL</strong>
              berlangsung, pastikan iklan anda sudah sesuai.
            </p>
          </div>
        </div>

        <!-- ── Modal Footer / Terapkan Button ───────────────────────────── -->
        <div class="p-4 sm:p-5 border-t border-border-light bg-surface-1 shrink-0">
          <button
            type="button"
            :disabled="!isButtonEnabled || loading"
            :class="[
              'w-full py-3.5 px-6 rounded-2xl text-sm font-bold transition-all text-center flex items-center justify-center gap-2',
              isButtonEnabled && !loading
                ? 'bg-primary hover:bg-primary-dark text-white shadow-xs cursor-pointer active:scale-98'
                : 'bg-surface-3 text-text-subtle cursor-not-allowed',
            ]"
            @click="handleApply"
          >
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Terapkan</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Info Ketentuan & Mekanisme Best Deal -->
    <BestDealInfoModal v-model="showInfoModal" />

    <!-- Modal Sukses Best Deal -->
    <BestDealSuccessModal
      v-model="showSuccessModal"
      :schedule-date="successScheduleDate"
      :product-id="hookProductId"
      @view-product="handleSuccessClose"
    />
  </Teleport>
</template>

