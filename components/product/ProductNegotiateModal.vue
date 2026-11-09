<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Image as ImageIcon, AlertCircle } from 'lucide-vue-next'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  modelValue: boolean
  currentPrice: number
  title?: string
  image?: string
  isSubmitting?: boolean
  oldId?: string
  initPrice?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'submit', price: number): void
}>()

const offerPrice = ref<number>(0)
const errorMsg = ref('')

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      offerPrice.value = props.initPrice && props.initPrice > 0 ? props.initPrice : 0
      errorMsg.value = ''
    }
  },
  { immediate: true }
)

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  const raw = target.value.replace(/\D/g, '')
  if (!raw) {
    offerPrice.value = 0
    errorMsg.value = ''
    return
  }
  const parsed = parseInt(raw, 10)
  // Mirror NegotiateController.changeInput: cap at oriPrice
  if (parsed > props.currentPrice) {
    offerPrice.value = props.currentPrice
  } else {
    offerPrice.value = parsed
  }
  errorMsg.value = ''
}

function submitOffer() {
  if (offerPrice.value <= 0) {
    errorMsg.value = 'Masukkan nominal tawaran Anda'
    return
  }
  emit('submit', offerPrice.value)
}

function closeModal() {
  emit('update:modelValue', false)
  offerPrice.value = 0
  errorMsg.value = ''
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
      @click="closeModal"
    >
      <div
        class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="closeModal"
            class="p-1.5 -ml-1.5 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X class="w-5 h-5" />
          </button>
          <h3 class="font-outfit font-bold text-lg text-text">
            {{ oldId ? 'Ubah Harga Nego' : 'Negosiasi Harga' }}
          </h3>
        </div>

        <!-- Product Info Row (60x60 thumbnail + title + Harga Awal) -->
        <div class="flex items-start gap-3.5">
          <div class="w-[60px] h-[60px] rounded-xl overflow-hidden bg-surface-2 border border-border shrink-0 flex items-center justify-center">
            <img
              v-if="image"
              :src="image"
              :alt="title || 'Produk'"
              class="w-full h-full object-cover"
            />
            <ImageIcon v-else class="w-6 h-6 text-text-subtle" />
          </div>
          <div class="flex-1 min-w-0 space-y-1">
            <p class="font-outfit font-medium text-sm text-text truncate">
              {{ title || 'Produk BekasKu' }}
            </p>
            <p class="font-outfit font-bold text-sm text-text">
              Harga Awal: {{ formatRupiah(currentPrice) }}
            </p>
          </div>
        </div>

        <!-- Input Field -->
        <div class="space-y-2.5 pt-2">
          <label class="block font-outfit font-semibold text-sm text-text">
            Harga yang kamu tawarkan
          </label>
          <div class="relative rounded-xl border border-border-light bg-white focus-within:border-primary transition-colors">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 font-outfit font-semibold text-base text-text-muted">
              Rp
            </span>
            <input
              :value="offerPrice > 0 ? offerPrice.toLocaleString('id-ID') : ''"
              @input="handleInput"
              type="text"
              inputmode="numeric"
              placeholder="0"
              class="w-full pl-11 pr-4 py-3.5 font-outfit font-semibold text-base text-text bg-transparent outline-hidden"
            />
          </div>
          <div v-if="errorMsg" class="flex items-center gap-1.5 text-xs text-danger pt-0.5">
            <AlertCircle class="w-3.5 h-3.5 shrink-0" />
            <span>{{ errorMsg }}</span>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="button"
          :disabled="offerPrice <= 0 || isSubmitting"
          @click="submitOffer"
          class="w-full h-13 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-400 text-white font-outfit font-bold text-base flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span v-else class="text-white">Tawarkan</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>
