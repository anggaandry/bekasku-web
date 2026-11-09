<script setup lang="ts">
import {
  X,
  Star,
  ImagePlus,
  Video,
  Trash2,
  CheckCircle,
  Loader2,
  MapPin,
  Store,
} from 'lucide-vue-next'
import type { TransactionDetail } from '~/types/transaction'
import type { ReviewData } from '~/types/review'

const props = defineProps<{
  modelValue: boolean
  detail: TransactionDetail
  transactionId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'success'): void
}>()

const { fetchReviewInit, submitReview, isLoading, isSubmitting } = useReview()

const activeTxId = computed(() => {
  return props.transactionId || props.detail?.id || props.detail?._id || ''
})

const reviewData = ref<ReviewData | null>(null)
const isReadOnly = ref(false)

const score = ref(5)
const serviceScore = ref(5)
const shippingScore = ref(5)
const reviewText = ref('')
const selectedImages = ref<string[]>([])
const selectedVideo = ref<string>('')
const submitError = ref('')
const submitSuccess = ref(false)

const fileInputImagesRef = ref<HTMLInputElement | null>(null)
const fileInputVideoRef = ref<HTMLInputElement | null>(null)

const scoreLabel = computed(() => {
  switch (score.value) {
    case 5:
      return 'Sangat Puas'
    case 4:
      return 'Puas'
    case 3:
      return 'Cukup'
    case 2:
      return 'Kurang Puas'
    case 1:
      return 'Kecewa'
    default:
      return 'Pilih Rating'
  }
})

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen && activeTxId.value) {
      resetForm()
      const data = await fetchReviewInit(activeTxId.value)
      if (data) {
        reviewData.value = data
        const hasExistingReview =
          Boolean(data.review && data.review.trim().length > 0) ||
          Boolean(data.score && data.score > 0) ||
          Boolean(props.detail?.review && props.detail.review.trim().length > 0)

        if (hasExistingReview) {
          isReadOnly.value = true
          score.value = data.score || 5
          serviceScore.value = data.service_score || 5
          shippingScore.value = data.shipping_score || 5
          reviewText.value = data.review || props.detail?.review || ''
          selectedImages.value = data.images || []
          selectedVideo.value = data.video || ''
        } else {
          isReadOnly.value = false
        }
      }
    }
  },
  { immediate: true }
)

function resetForm() {
  score.value = 5
  serviceScore.value = 5
  shippingScore.value = 5
  reviewText.value = ''
  selectedImages.value = []
  selectedVideo.value = ''
  submitError.value = ''
  submitSuccess.value = false
}

function close() {
  emit('update:modelValue', false)
}

function handleImageSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const remaining = 5 - selectedImages.value.length
  if (remaining <= 0) return

  const files = Array.from(target.files).slice(0, remaining)
  for (const file of files) {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result && selectedImages.value.length < 5) {
        selectedImages.value.push(result)
      }
    }
    reader.readAsDataURL(file)
  }
  target.value = ''
}

function removeImage(index: number) {
  selectedImages.value.splice(index, 1)
}

function handleVideoSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  if (file.size > 50 * 1024 * 1024) {
    submitError.value = 'Ukuran video maksimal 50 MB'
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    selectedVideo.value = event.target?.result as string
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function removeVideo() {
  selectedVideo.value = ''
}

async function handleSubmit() {
  if (score.value === 0) {
    submitError.value = 'Mohon berikan nilai rating'
    return
  }

  submitError.value = ''
  const res = await submitReview({
    transaction_id: activeTxId.value,
    review: reviewText.value.trim(),
    review_text: reviewText.value.trim(),
    review_score: score.value,
    review_service_score: serviceScore.value,
    review_shipping_score: shippingScore.value,
    review_images: selectedImages.value,
    review_video: selectedVideo.value,
  })

  if (res.success) {
    submitSuccess.value = true
    emit('success')
    setTimeout(() => {
      close()
    }, 1200)
  } else {
    submitError.value = res.message
  }
}

const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

watch(
  () => props.modelValue,
  (val) => {
    if (import.meta.client) {
      if (val) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (import.meta.client && props.modelValue) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body" v-if="isMounted">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-outfit overscroll-contain"
      @click.self="close"
    >
    <div
      class="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-border animate-in fade-in zoom-in duration-200 overflow-hidden"
    >
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-border flex items-center justify-between shrink-0 bg-white">
        <div>
          <h3 class="font-outfit font-bold text-base sm:text-lg text-text">
            {{ isReadOnly ? 'Ulasan Pesanan' : 'Beri Penilaian' }}
          </h3>
          <p class="text-xs text-text-muted mt-0.5">
            {{ isReadOnly ? 'Ulasan yang telah Anda berikan untuk transaksi ini' : 'Beri ulasan tentang produk dan pelayanan penjual' }}
          </p>
        </div>
        <button
          type="button"
          class="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
          @click="close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="p-5 overflow-y-auto space-y-5 text-text">
        <!-- Initial Loading State -->
        <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center text-center">
          <Loader2 class="w-8 h-8 text-primary animate-spin mb-3" />
          <p class="text-xs text-text-muted font-outfit">Memuat data ulasan...</p>
        </div>

        <template v-else>
          <!-- Product & Seller Info Header -->
          <div
            v-if="reviewData && reviewData.products && reviewData.products.length > 0"
            class="flex items-center gap-3.5 p-3 rounded-xl bg-surface-2 border border-border"
          >
            <img
              :src="reviewData.products[0].image"
              :alt="reviewData.products[0].title"
              class="w-14 h-14 rounded-lg object-cover bg-surface-3 shrink-0 border border-border"
            />
            <div class="min-w-0 flex-1">
              <h4 class="font-outfit font-semibold text-sm text-text line-clamp-1">
                {{ reviewData.products[0].title }}
              </h4>
              <div class="flex items-center gap-1.5 mt-1 text-xs text-text-muted">
                <Store class="w-3.5 h-3.5 shrink-0" />
                <span class="truncate">{{ reviewData.name || 'Penjual' }}</span>
              </div>
              <div v-if="reviewData.location" class="flex items-center gap-1 text-[11px] text-text-muted mt-0.5">
                <MapPin class="w-3 h-3 shrink-0" />
                <span class="truncate">{{ reviewData.location }}</span>
              </div>
            </div>
          </div>

          <!-- READ ONLY VIEW -->
          <div v-if="isReadOnly" class="space-y-4">
            <!-- Stars -->
            <div class="flex flex-col items-center justify-center py-3 bg-surface-2 rounded-xl border border-border">
              <div class="flex items-center gap-1.5">
                <Star
                  v-for="s in 5"
                  :key="s"
                  class="w-7 h-7"
                  :class="s <= score ? 'fill-amber-400 text-amber-400' : 'text-border fill-transparent'"
                />
              </div>
              <span class="font-outfit text-sm font-bold text-text mt-2">
                {{ scoreLabel }} ({{ score }}/5)
              </span>
            </div>

            <!-- Review Text -->
            <div v-if="reviewText" class="p-3.5 rounded-xl bg-surface-2 border border-border text-xs leading-relaxed text-text">
              <p class="font-semibold text-text-muted mb-1 text-[11px]">Ulasan Anda:</p>
              <p>{{ reviewText }}</p>
            </div>

            <!-- Detailed Ratings -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2.5 rounded-lg bg-surface-2 border border-border flex items-center justify-between">
                <span class="text-text-muted">Layanan Penjual</span>
                <span class="font-bold flex items-center gap-1">
                  <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {{ serviceScore }}
                </span>
              </div>
              <div class="p-2.5 rounded-lg bg-surface-2 border border-border flex items-center justify-between">
                <span class="text-text-muted">Kecepatan Kirim</span>
                <span class="font-bold flex items-center gap-1">
                  <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {{ shippingScore }}
                </span>
              </div>
            </div>

            <!-- Uploaded Photos in Read-Only -->
            <div v-if="selectedImages.length > 0" class="space-y-1.5">
              <span class="text-xs font-semibold text-text-muted">Foto Ulasan:</span>
              <div class="flex flex-wrap gap-2">
                <img
                  v-for="(img, idx) in selectedImages"
                  :key="idx"
                  :src="img"
                  alt="Ulasan"
                  class="w-16 h-16 rounded-lg object-cover border border-border"
                />
              </div>
            </div>

            <div class="pt-2">
              <button
                type="button"
                class="w-full h-11 rounded-xl bg-surface-2 hover:bg-surface-3 text-text font-outfit font-semibold text-sm transition-colors cursor-pointer border border-border"
                @click="close"
              >
                Tutup
              </button>
            </div>
          </div>

          <!-- CREATE REVIEW FORM -->
          <div v-else class="space-y-4">
            <!-- Main Product Rating -->
            <div class="flex flex-col items-center justify-center py-3 bg-surface-2 rounded-xl border border-border">
              <span class="text-xs font-outfit font-semibold text-text-muted mb-2">
                Beri Ulasan produk
              </span>
              <div class="flex items-center gap-2">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                  @click="score = star"
                >
                  <Star
                    class="w-8 h-8 transition-colors"
                    :class="star <= score ? 'fill-amber-400 text-amber-400' : 'text-border fill-transparent'"
                  />
                </button>
              </div>
              <span class="font-outfit text-xs font-semibold text-text mt-2">
                {{ scoreLabel }}
              </span>
            </div>

            <!-- Media Section (Photo & Video Upload) -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-text">Foto & Video (Opsional)</span>
                <span class="text-text-muted">{{ selectedImages.length }}/5 foto</span>
              </div>

              <div class="flex flex-wrap gap-2.5">
                <!-- Image Previews -->
                <div
                  v-for="(img, idx) in selectedImages"
                  :key="idx"
                  class="relative w-16 h-16 rounded-xl overflow-hidden border border-border group shrink-0"
                >
                  <img :src="img" alt="Foto Ulasan" class="w-full h-full object-cover" />
                  <button
                    type="button"
                    class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"
                    @click="removeImage(idx)"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>

                <!-- Add Image Button -->
                <button
                  v-if="selectedImages.length < 5"
                  type="button"
                  class="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-primary text-text-muted hover:text-primary flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer shrink-0 bg-surface-2"
                  @click="fileInputImagesRef?.click()"
                >
                  <ImagePlus class="w-5 h-5" />
                  <span class="text-[10px] font-medium">+ Foto</span>
                </button>
                <input
                  ref="fileInputImagesRef"
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="handleImageSelect"
                />

                <!-- Video Slot -->
                <div
                  v-if="selectedVideo"
                  class="relative w-16 h-16 rounded-xl overflow-hidden border border-border shrink-0 bg-black flex items-center justify-center"
                >
                  <video :src="selectedVideo" class="w-full h-full object-cover"></video>
                  <button
                    type="button"
                    class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"
                    @click="removeVideo"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>

                <button
                  v-else
                  type="button"
                  class="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-primary text-text-muted hover:text-primary flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer shrink-0 bg-surface-2"
                  @click="fileInputVideoRef?.click()"
                >
                  <Video class="w-5 h-5" />
                  <span class="text-[10px] font-medium">+ Video</span>
                </button>
                <input
                  ref="fileInputVideoRef"
                  type="file"
                  accept="video/*"
                  class="hidden"
                  @change="handleVideoSelect"
                />
              </div>
            </div>

            <!-- Review Text Input -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-text">
                Tulis Ulasan
              </label>
              <textarea
                v-model="reviewText"
                rows="3"
                maxlength="500"
                placeholder="Ceritakan kepuasan Anda mengenai kualitas barang, respon penjual, dan pengalaman berbelanja..."
                class="w-full p-3 rounded-xl border border-border focus:border-primary focus:outline-hidden text-xs font-outfit text-text resize-none bg-white transition-colors"
              ></textarea>
              <div class="text-right text-[11px] text-text-muted">
                {{ reviewText.length }}/500
              </div>
            </div>

            <!-- Compact Rating Rows: Seller Service & Shipping Speed -->
            <div class="space-y-3 pt-2 border-t border-border">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-text">Layanan Penjual</span>
                <div class="flex items-center gap-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    class="p-0.5 cursor-pointer"
                    @click="serviceScore = star"
                  >
                    <Star
                      class="w-5 h-5"
                      :class="star <= serviceScore ? 'fill-amber-400 text-amber-400' : 'text-border fill-transparent'"
                    />
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-text">Kecepatan Pengiriman</span>
                <div class="flex items-center gap-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    class="p-0.5 cursor-pointer"
                    @click="shippingScore = star"
                  >
                    <Star
                      class="w-5 h-5"
                      :class="star <= shippingScore ? 'fill-amber-400 text-amber-400' : 'text-border fill-transparent'"
                    />
                  </button>
                </div>
              </div>
            </div>

            <!-- Error Banner -->
            <div v-if="submitError" class="p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
              {{ submitError }}
            </div>

            <!-- Success Banner -->
            <div v-if="submitSuccess" class="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 flex items-center gap-2">
              <CheckCircle class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ulasan berhasil dikirim. Terima kasih!</span>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button
                type="button"
                :disabled="isSubmitting || submitSuccess || score === 0"
                class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-sm transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-xs"
                @click="handleSubmit"
              >
                <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin mr-2" />
                <span>{{ isSubmitting ? 'Mengirim Ulasan...' : 'Kirim Ulasan' }}</span>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</Teleport>
</template>
