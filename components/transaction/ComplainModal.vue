<script setup lang="ts">
import {
  X,
  AlertTriangle,
  CheckCircle,
  Truck,
  ImagePlus,
  Video,
  Trash2,
  Loader2,
  ChevronRight,
  Minus,
  Plus,
  ArrowLeft,
  Check,
  Package,
  MapPin,
  Copy,
  Play,
  Receipt,
} from 'lucide-vue-next'
import type { TransactionDetail } from '~/types/transaction'
import type {
  ComplainProductItem,
  ComplainCourierItem,
} from '~/types/complain'
import { COMPLAIN_REASONS } from '~/utils/constants'
import { useHelpChatStore } from '~/stores/helpChat'
import { formatDate, formatRupiah, formatNumber } from '~/utils/format'
import { sanitizeMediaUrl } from '~/utils/media'

const props = defineProps<{
  modelValue: boolean
  detail: TransactionDetail
  transactionId?: string
  initialMode?: 'select' | 'form' | 'detail' | 'waybill'
  isSeller?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'success'): void
}>()

const {
  fetchComplainDetail,
  createComplain,
  acceptComplain,
  declineComplain,
  finishComplain,
  initWaybill,
  submitWaybill,
  complainDetail,
  couriers,
  isLoading,
  isSubmitting,
} = useComplain()

const activeTxId = computed(() => {
  return props.transactionId || props.detail?.id || props.detail?._id || ''
})

const mode = ref<'select' | 'form' | 'detail' | 'waybill'>('detail')

// Form State
const selectedProducts = ref<ComplainProductItem[]>([])
const selectedReason = ref<string>('')
const complainMessage = ref<string>('')
const selectedImages = ref<string[]>([])
const selectedVideo = ref<string>('')
const showReasonPicker = ref(false)
const showConfirmBarrier = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Waybill State
const selectedCourier = ref<ComplainCourierItem | null>(null)
const waybillNumber = ref('')
const waybillImage = ref('')

// Decline Reason State (for seller)
const showDeclineModal = ref(false)
const declineReasonInput = ref('')
const showFinishConfirmModal = ref(false)

const fileInputImagesRef = ref<HTMLInputElement | null>(null)
const fileInputVideoRef = ref<HTMLInputElement | null>(null)
const fileInputWaybillRef = ref<HTMLInputElement | null>(null)

const authStore = useAuthStore()
const helpChatStore = useHelpChatStore()

const isSeller = computed(() => {
  if (typeof props.isSeller === 'boolean') return props.isSeller
  const myId = (authStore.user as any)?.id || (authStore.user as any)?._id
  if (myId && props.detail?.seller_id) {
    return String(props.detail.seller_id) === String(myId)
  }
  return props.detail?.seller === true
})

const totalComplainPrice = computed(() => {
  return selectedProducts.value.reduce((acc, p) => acc + (p.product_price * p.total_complain), 0)
})

const isFormValid = computed(() => {
  return (
    selectedReason.value.length > 0 &&
    complainMessage.value.trim().length >= 5 &&
    selectedImages.value.length > 0 &&
    totalComplainPrice.value > 0
  )
})

const invoiceCopied = ref(false)
function copyInvoiceNumber(text: string) {
  if (!text || !navigator?.clipboard) return
  navigator.clipboard.writeText(text)
  invoiceCopied.value = true
  setTimeout(() => {
    invoiceCopied.value = false
  }, 2000)
}

const waybillCopied = ref(false)
function copyWaybillNumber(text: string) {
  if (!text || !navigator?.clipboard) return
  navigator.clipboard.writeText(text)
  waybillCopied.value = true
  setTimeout(() => {
    waybillCopied.value = false
  }, 2000)
}

const previewMedia = ref<{ url: string; type: 'image' | 'video' } | null>(null)

const previewZoomImage = computed({
  get: () => previewMedia.value?.url || null,
  set: (val: string | null) => {
    if (!val) {
      previewMedia.value = null
    } else {
      const isVid = val.endsWith('.mp4') || val.includes('video') || val.includes('/videos-mobile%2F')
      previewMedia.value = { url: val, type: isVid ? 'video' : 'image' }
    }
  },
})

function openMediaPreview(url: string, type: 'image' | 'video') {
  if (!url) return
  previewMedia.value = { url, type }
}

function closeMediaPreview() {
  previewMedia.value = null
}

const activeComplain = computed(() => {
  const d = (props.detail || {}) as any
  const c = (complainDetail.value || {}) as any

  const statusCode =
    (typeof c.status === 'object' ? c.status?.code : c.status_code) ||
    (typeof d.status === 'object' ? d.status?.code : '') ||
    'complain'

  const statusName =
    (typeof c.status === 'object' ? c.status?.name : c.status_name) ||
    (typeof d.status === 'object' ? d.status?.name : String(d.status || '')) ||
    'Sedang dikomplain'

  // Items
  const rawItems =
    (c.complain_items && c.complain_items.length > 0)
      ? c.complain_items
      : (d.complain_items && d.complain_items.length > 0)
        ? d.complain_items
        : (d.products || d.order?.products || [])

  const items = rawItems.map((item: any) => ({
    id: item.id || item.product_id || '',
    title: item.product_title || item.title || item.product_name || 'Produk',
    image: sanitizeMediaUrl(item.product_image || item.image || '', ''),
    price: item.product_price || item.price || 0,
    totalComplain: item.total_complain || item.total || 1,
    shopName: item.shop_name || d.seller_name || (typeof d.order === 'object' ? d.order?.seller_name : '') || 'BekasKu',
  }))

  // Images
  let rawImages =
    (c.complain_images && c.complain_images.length > 0)
      ? c.complain_images
      : (d.complain_images && d.complain_images.length > 0)
        ? d.complain_images
        : (d.order?.complain_images || [])

  if (typeof rawImages === 'string') {
    try {
      rawImages = JSON.parse(rawImages)
    } catch {
      rawImages = [rawImages]
    }
  }

  const images = (Array.isArray(rawImages) ? rawImages : [rawImages]).map((img: any) => {
    const raw = typeof img === 'string' ? img : (img.image || img.url || img.path || '')
    return sanitizeMediaUrl(raw, '')
  }).filter(Boolean)

  let rawVideo = c.complain_video || d.complain_video || d.order?.complain_video || ''
  if (typeof rawVideo !== 'string' && rawVideo) {
    rawVideo = (rawVideo as any).url || (rawVideo as any).video || ''
  }
  const video = rawVideo ? sanitizeMediaUrl(String(rawVideo), '') : ''

  const price = c.complain_price || d.complain_price || d.price || 0
  const totalComplainCount = items.reduce((acc: number, it: any) => acc + (Number(it.totalComplain) || 1), 0)

  return {
    invoice: d.invoice_no || c.invoice_no || d.id || '',
    statusCode,
    statusName,
    date: c.complain_date || d.complain_date || d.buy_date || '',
    reason: c.complain_reason || d.complain_reason || 'Barang rusak/cacat saat diterima',
    message: c.complain_message || d.complain_message || '',
    detailNote: c.complain_detail || d.complain_detail || '',
    declineReason: c.complain_decline_reason || d.complain_decline_reason || '',
    price,
    items,
    totalComplainCount,
    images,
    video,
    returnAddress: c.return_address || d.return_address || null,
    returnWaybill: c.return_waybill || d.return_waybill || '',
    returnCourierName: c.return_courier_name || d.return_courier_name || '',
    returnImage: sanitizeMediaUrl(c.return_image || d.return_image || '', ''),
  }
})

const hasReturnShipping = computed(() => {
  return Boolean(activeComplain.value.returnAddress || activeComplain.value.returnWaybill)
})

const scrollBodyRef = ref<HTMLElement | null>(null)

function resetScroll() {
  nextTick(() => {
    if (scrollBodyRef.value) {
      scrollBodyRef.value.scrollTop = 0
    }
  })
}

watch(mode, () => {
  resetScroll()
})

watch(
  () => isLoading.value,
  (loading) => {
    if (!loading) {
      resetScroll()
    }
  }
)

watch(
  () => props.initialMode,
  (newMode) => {
    if (newMode) mode.value = newMode
  }
)

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen && activeTxId.value) {
      errorMessage.value = ''
      successMessage.value = ''
      showConfirmBarrier.value = false
      showDeclineModal.value = false
      previewZoomImage.value = null

      // Determine initial mode based on transaction status
      const code = (typeof props.detail?.status === 'object' ? props.detail.status?.code : '') || ''
      const hasComplain =
        code === 'complain' ||
        code === 'oncomplain' ||
        code === 'packed_complaining' ||
        code === 'returned' ||
        code === 'onship_return' ||
        Boolean(props.detail?.complain_date)

      if (props.initialMode) {
        mode.value = props.initialMode
      } else if (hasComplain) {
        mode.value = 'detail'
      } else {
        mode.value = 'select'
      }

      initProducts()

      if (mode.value === 'detail') {
        await fetchComplainDetail(activeTxId.value)
      } else if (mode.value === 'waybill') {
        await initWaybill()
      }
      resetScroll()
    }
  },
  { immediate: true }
)

function initProducts() {
  const raw = props.detail?.products || props.detail?.order?.products || props.detail?.product_id || []
  selectedProducts.value = raw.map((p) => {
    const qty = p.total_product || p.total || 1
    const price = p.product_price || p.price || 0
    return {
      product_id: p.id || p.product_id || '',
      product_image: p.product_image || p.image || '',
      product_title: p.product_title || p.title || p.product_name || '',
      product_price: price,
      total_price: price * qty,
      total_product: qty,
      total_complain: qty,
    }
  })
}

function close() {
  emit('update:modelValue', false)
}

function handleAddQty(index: number) {
  const item = selectedProducts.value[index]
  if (item && item.total_complain < item.total_product) {
    item.total_complain++
    item.total_price = item.product_price * item.total_complain
  }
}

function handleSubQty(index: number) {
  const item = selectedProducts.value[index]
  if (item && item.total_complain > 0) {
    item.total_complain--
    item.total_price = item.product_price * item.total_complain
  }
}

function goToForm() {
  if (totalComplainPrice.value <= 0) {
    errorMessage.value = 'Pilih minimal 1 barang untuk dikomplain'
    return
  }
  errorMessage.value = ''
  mode.value = 'form'
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
  if (!file) return

  if (file.size > 50 * 1024 * 1024) {
    errorMessage.value = 'Ukuran video maksimal 50 MB'
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    selectedVideo.value = event.target?.result as string
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function handleWaybillImageSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    waybillImage.value = event.target?.result as string
  }
  reader.readAsDataURL(file)
  target.value = ''
}

async function handleConfirmSubmitComplain() {
  if (!isFormValid.value) {
    errorMessage.value = 'Mohon lengkapi seluruh data komplain'
    return
  }

  showConfirmBarrier.value = false
  errorMessage.value = ''

  const formattedImages = selectedImages.value.map((img) => ({
    image: img,
    description: '',
  }))

  const res = await createComplain({
    transaction_id: activeTxId.value,
    complain_items: JSON.stringify(selectedProducts.value.filter((p) => p.total_complain > 0)),
    complain_images: JSON.stringify(formattedImages),
    complain_message: complainMessage.value.trim(),
    complain_reason: selectedReason.value,
    complain_price: totalComplainPrice.value,
    complain_video: selectedVideo.value,
  })

  if (res.success) {
    successMessage.value = 'Komplain berhasil diajukan'
    emit('success')
    setTimeout(async () => {
      mode.value = 'detail'
      await fetchComplainDetail(activeTxId.value)
    }, 1000)
  } else {
    errorMessage.value = res.message
  }
}

async function handleAcceptComplain() {
  const res = await acceptComplain(activeTxId.value, props.detail?.destination_address || '')
  if (res.success) {
    successMessage.value = 'Komplain berhasil diterima'
    emit('success')
    await fetchComplainDetail(activeTxId.value)
  } else {
    errorMessage.value = res.message
  }
}

async function handleDeclineComplainSubmit() {
  if (!declineReasonInput.value.trim()) {
    errorMessage.value = 'Wajib menyertakan alasan penolakan'
    return
  }
  showDeclineModal.value = false
  const res = await declineComplain(activeTxId.value, declineReasonInput.value.trim())
  if (res.success) {
    successMessage.value = 'Komplain berhasil ditolak'
    emit('success')
    await fetchComplainDetail(activeTxId.value)
  } else {
    errorMessage.value = res.message
  }
}

async function handleFinishReturnSubmit() {
  showFinishConfirmModal.value = true
}

async function confirmFinishReturn() {
  showFinishConfirmModal.value = false
  const res = await finishComplain(activeTxId.value)
  if (res.success) {
    successMessage.value = 'Komplain selesai diproses'
    emit('success')
    await fetchComplainDetail(activeTxId.value)
  } else {
    errorMessage.value = res.message
  }
}

async function openWaybillInput() {
  mode.value = 'waybill'
  await initWaybill()
}

async function handleWaybillSubmit() {
  if (!selectedCourier.value || !waybillNumber.value.trim() || !waybillImage.value) {
    errorMessage.value = 'Mohon lengkapi kurir, nomor resi, dan foto bukti kirim'
    return
  }

  const res = await submitWaybill({
    transaction_id: activeTxId.value,
    courier_code: selectedCourier.value.code,
    return_courier_code: selectedCourier.value.code,
    courier_name: selectedCourier.value.name,
    return_courier_name: selectedCourier.value.name,
    waybill: waybillNumber.value.trim(),
    return_waybill: waybillNumber.value.trim(),
    image: waybillImage.value,
    return_image: waybillImage.value,
  })

  if (res.success) {
    successMessage.value = 'Resi pengembalian berhasil diinput'
    emit('success')
    setTimeout(async () => {
      mode.value = 'detail'
      await fetchComplainDetail(activeTxId.value)
    }, 1000)
  } else {
    errorMessage.value = res.message
  }
}

function openBekaskuCenterHelp() {
  const inv = props.detail?.invoice_no || activeTxId.value
  const msg = inv
    ? `Halo BekasKu Center, saya butuh mediasi terkait komplain transaksi No. Invoice: ${inv}`
    : 'Halo BekasKu Center, saya butuh mediasi terkait komplain transaksi.'
  close()
  helpChatStore.openHelpChat({
    topic: 'complain',
    referenceId: activeTxId.value,
    referenceTitle: inv ? `Komplain #${inv}` : 'Komplain Transaksi',
    initialMessage: msg,
  })
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
      :class="[
        mode === 'detail' ? 'max-w-4xl lg:max-w-5xl' : 'max-w-lg',
        'bg-white rounded-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-border animate-in fade-in zoom-in duration-200 overflow-hidden text-text transition-all my-auto',
      ]"
    >
      <!-- Header -->
      <div class="px-5 py-4 border-b border-border flex items-center justify-between shrink-0 bg-white">
        <div class="flex items-center gap-2.5">
          <button
            v-if="mode === 'form'"
            type="button"
            class="p-1 -ml-1 text-text-muted hover:text-text rounded-full cursor-pointer"
            @click="mode = 'select'"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <button
            v-else-if="mode === 'waybill'"
            type="button"
            class="p-1 -ml-1 text-text-muted hover:text-text rounded-full cursor-pointer"
            @click="mode = 'detail'"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div>
            <h3 class="font-outfit font-bold text-base sm:text-lg text-text">
              <span v-if="mode === 'select'">Pilih Barang Pengembalian</span>
              <span v-else-if="mode === 'form'">Ajukan Komplain</span>
              <span v-else-if="mode === 'waybill'">Input Resi Pengembalian</span>
              <span v-else>Detail Komplain</span>
            </h3>
            <p class="text-xs text-text-muted mt-0.5">
              {{ detail?.invoice_no || activeTxId }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
          @click="close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div
        ref="scrollBodyRef"
        class="p-5 md:p-6 overflow-y-auto min-h-0 flex-1 space-y-5 text-text custom-scrollbar overscroll-contain"
      >
        <!-- Loading State -->
        <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center text-center">
          <Loader2 class="w-8 h-8 text-primary animate-spin mb-3" />
          <p class="text-xs text-text-muted font-outfit">Memuat data...</p>
        </div>

        <template v-else>
          <!-- Error & Success Banners -->
          <div v-if="errorMessage" class="p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{{ successMessage }}</span>
          </div>

          <!-- STEP 1: SELECT PRODUCTS -->
          <div v-if="mode === 'select'" class="space-y-4">
            <p class="text-xs text-text-muted">
              Pilih barang yang ingin Anda ajukan pengembalian serta sesuaikan jumlahnya:
            </p>

            <div class="space-y-3">
              <div
                v-for="(product, idx) in selectedProducts"
                :key="idx"
                class="p-3 rounded-xl border border-border bg-surface-2 flex items-center gap-3"
              >
                <img
                  :src="product.product_image"
                  :alt="product.product_title"
                  class="w-14 h-14 rounded-lg object-cover bg-surface-3 shrink-0 border border-border"
                />
                <div class="min-w-0 flex-1">
                  <h4 class="font-outfit font-semibold text-xs text-text line-clamp-1">
                    {{ product.product_title }}
                  </h4>
                  <p class="text-[11px] text-text-muted mt-0.5">
                    Dibeli: {{ product.total_product }} pcs &bull; Rp {{ formatNumber(product.product_price) }}
                  </p>
                  <p class="text-xs font-bold text-primary mt-1">
                    Total: Rp {{ formatNumber(product.product_price * product.total_complain) }}
                  </p>
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center gap-2 bg-white rounded-lg border border-border px-2 py-1 shrink-0">
                  <button
                    type="button"
                    class="p-1 text-text-muted hover:text-text cursor-pointer disabled:opacity-30"
                    :disabled="product.total_complain <= 0"
                    @click="handleSubQty(idx)"
                  >
                    <Minus class="w-3.5 h-3.5" />
                  </button>
                  <span class="text-xs font-bold w-4 text-center">{{ product.total_complain }}</span>
                  <button
                    type="button"
                    class="p-1 text-text-muted hover:text-text cursor-pointer disabled:opacity-30"
                    :disabled="product.total_complain >= product.total_product"
                    @click="handleAddQty(idx)"
                  >
                    <Plus class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 2: FORM COMPLAIN -->
          <div v-else-if="mode === 'form'" class="space-y-4">
            <!-- Selected Product Summary -->
            <div class="p-3 rounded-xl bg-surface-2 border border-border flex items-center justify-between text-xs">
              <span class="text-text-muted">Barang Dikomplain:</span>
              <span class="font-semibold text-text">
                {{ selectedProducts.filter(p => p.total_complain > 0).length }} jenis produk &bull; Rp {{ formatNumber(totalComplainPrice) }}
              </span>
            </div>

            <!-- Reason Selector Trigger -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-text">
                Alasan Pengembalian <span class="text-red-500">*</span>
              </label>
              <button
                type="button"
                class="w-full p-3 rounded-xl border border-border hover:border-primary bg-white text-xs font-outfit flex items-center justify-between cursor-pointer transition-colors"
                @click="showReasonPicker = true"
              >
                <span :class="selectedReason ? 'text-text font-medium' : 'text-text-muted'">
                  {{ selectedReason || 'Pilih alasan pengembalian...' }}
                </span>
                <ChevronRight class="w-4 h-4 text-text-muted" />
              </button>
            </div>

            <!-- Reason Picker Sheet Modal -->
            <div
              v-if="showReasonPicker"
              class="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs"
              @click.self="showReasonPicker = false"
            >
              <div class="bg-white rounded-t-2xl sm:rounded-2xl max-w-sm w-full p-5 space-y-3 shadow-2xl border border-border">
                <div class="flex items-center justify-between pb-2 border-b border-border">
                  <h4 class="font-outfit font-bold text-sm text-text">Pilih Alasan</h4>
                  <button type="button" @click="showReasonPicker = false">
                    <X class="w-4 h-4 text-text-muted" />
                  </button>
                </div>
                <div class="space-y-1">
                  <button
                    v-for="reason in COMPLAIN_REASONS"
                    :key="reason"
                    type="button"
                    class="w-full p-3 rounded-xl text-left text-xs font-outfit flex items-center justify-between hover:bg-surface-2 transition-colors cursor-pointer"
                    :class="selectedReason === reason ? 'bg-primary/5 text-primary font-bold' : 'text-text'"
                    @click="selectedReason = reason; showReasonPicker = false"
                  >
                    <span>{{ reason }}</span>
                    <Check v-if="selectedReason === reason" class="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Complain Message Input -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-text">
                Keterangan Komplain <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="complainMessage"
                rows="3"
                maxlength="500"
                placeholder="Jelaskan secara rinci kendala atau cacat pada barang yang Anda terima..."
                class="w-full p-3 rounded-xl border border-border focus:border-primary focus:outline-hidden text-xs font-outfit text-text resize-none bg-white transition-colors"
              ></textarea>
              <div class="text-right text-[11px] text-text-muted">
                {{ complainMessage.length }}/500
              </div>
            </div>

            <!-- Photo & Video Evidence Section -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-text">
                  Foto Bukti <span class="text-red-500">*</span> (Maks. 5)
                </span>
                <span class="text-text-muted">{{ selectedImages.length }}/5</span>
              </div>

              <div class="flex flex-wrap gap-2.5">
                <div
                  v-for="(img, idx) in selectedImages"
                  :key="idx"
                  class="relative w-16 h-16 rounded-xl overflow-hidden border border-border shrink-0"
                >
                  <img :src="img" alt="Bukti" class="w-full h-full object-cover" />
                  <button
                    type="button"
                    class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"
                    @click="removeImage(idx)"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>

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
                    @click="selectedVideo = ''"
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

            <!-- Submit Button Trigger Confirm Barrier -->
            <div class="pt-2">
              <button
                type="button"
                :disabled="!isFormValid || isSubmitting"
                class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-sm transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-xs"
                @click="showConfirmBarrier = true"
              >
                <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin mr-2" />
                <span>Kirim Komplain</span>
              </button>
            </div>

            <!-- Confirmation Barrier Modal -->
            <div
              v-if="showConfirmBarrier"
              class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            >
              <div class="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-border">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-red-100 text-primary flex items-center justify-center shrink-0">
                    <AlertTriangle class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="font-outfit font-bold text-sm text-text">Kirim Komplain</h4>
                    <p class="text-xs text-text-muted mt-0.5">
                      Apakah kamu yakin data komplain yang diisi sudah benar dan lengkap?
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    class="flex-1 h-10 rounded-xl border border-border text-text font-outfit text-xs font-semibold hover:bg-surface-2 cursor-pointer"
                    @click="showConfirmBarrier = false"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    :disabled="isSubmitting"
                    class="flex-1 h-10 rounded-xl bg-primary text-white font-outfit text-xs font-semibold hover:bg-primary-dark cursor-pointer disabled:opacity-50"
                    @click="handleConfirmSubmitComplain"
                  >
                    Kirim Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 3: COMPLAIN DETAIL VIEW (2 Columns on Desktop) -->
          <div v-else-if="mode === 'detail'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
              <!-- Left Column -->
              <div class="space-y-4">
                <!-- 1. Top Financial & Invoice Summary -->
                <div class="bg-surface-2 rounded-xl p-3.5 sm:p-4 border border-border space-y-2.5 shadow-2xs">
                  <div class="flex items-center justify-between pb-2 border-b border-border/70">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <Receipt class="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span class="font-outfit font-bold text-xs sm:text-sm text-text truncate">
                        {{ activeComplain.invoice || detail?.invoice_no }}
                      </span>
                    </div>
                    <button
                      type="button"
                      class="text-xs font-outfit font-semibold text-primary hover:underline cursor-pointer shrink-0 ml-2"
                      @click="copyInvoiceNumber(activeComplain.invoice || detail?.invoice_no || '')"
                    >
                      {{ invoiceCopied ? 'Disalin!' : 'Copy' }}
                    </button>
                  </div>

                  <div class="flex items-center justify-between text-xs font-outfit">
                    <span class="text-text-muted">Pengajuan Pengembalian</span>
                    <span class="font-medium text-text">{{ activeComplain.date ? formatDate(activeComplain.date) : '-' }}</span>
                  </div>

                  <div class="flex items-center justify-between text-xs font-outfit">
                    <span class="text-text-muted">Jumlah Barang Dikembalikan</span>
                    <span class="font-medium text-text">{{ activeComplain.totalComplainCount }} Barang</span>
                  </div>

                  <div class="pt-2 border-t border-border/70 flex items-center justify-between">
                    <span class="font-outfit font-bold text-xs sm:text-sm text-text">
                      Total Pengembalian Dana
                    </span>
                    <span class="font-outfit font-bold text-sm sm:text-base text-primary">
                      {{ formatRupiah(activeComplain.price) }}
                    </span>
                  </div>
                </div>

                <!-- 2. Barang yang Dikembalikan (Products Group) -->
                <div class="space-y-2">
                  <h4 class="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Barang yang dikembalikan
                  </h4>
                  <div class="space-y-2">
                    <div
                      v-for="(item, idx) in activeComplain.items"
                      :key="idx"
                      class="p-3 rounded-xl border border-border bg-white flex items-center gap-3 shadow-2xs"
                    >
                      <div class="w-12 h-12 rounded-lg bg-surface-2 shrink-0 border border-border overflow-hidden flex items-center justify-center">
                        <img
                          v-if="item.image"
                          :src="item.image"
                          :alt="item.title"
                          class="w-full h-full object-cover"
                          @error="(e: any) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden') }"
                        />
                        <div :class="['w-full h-full flex items-center justify-center bg-surface-2 text-text-muted', item.image ? 'hidden' : '']">
                          <Package class="w-5 h-5" />
                        </div>
                      </div>
                      <div class="min-w-0 flex-1">
                        <h5 class="font-outfit font-bold text-xs sm:text-sm text-text line-clamp-1">
                          {{ item.title }}
                        </h5>
                        <p class="text-xs text-text-muted mt-0.5">
                          {{ item.shopName }}
                        </p>
                        <p class="text-xs font-semibold text-text mt-1">
                          {{ item.totalComplain }}x {{ formatRupiah(item.price) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 3. Alasan & Bukti Masalah (Shown on Left when return shipping is active) -->
                <div v-if="hasReturnShipping" class="p-3.5 sm:p-4 rounded-xl border border-border bg-white space-y-3 text-xs font-outfit shadow-2xs">
                  <div>
                    <span class="text-text-muted text-[11px] block font-medium">Alasan Pengembalian:</span>
                    <p class="font-semibold text-text text-xs sm:text-sm mt-0.5">{{ activeComplain.reason }}</p>
                  </div>

                  <div v-if="activeComplain.message">
                    <span class="text-text-muted text-[11px] block mb-1 font-medium">Keterangan Pembeli:</span>
                    <p class="p-2.5 rounded-lg bg-surface-2 text-text leading-relaxed text-xs border border-border/50">
                      {{ activeComplain.message }}
                    </p>
                  </div>

                  <!-- Foto & Video Bukti Media Grid -->
                  <div v-if="activeComplain.images.length > 0 || activeComplain.video" class="pt-2 border-t border-border/60 space-y-2">
                    <span class="text-text-muted text-[11px] block font-medium">Bukti Foto & Video:</span>
                    <div class="flex flex-wrap items-center gap-2.5">
                      <div
                        v-for="(img, idx) in activeComplain.images"
                        :key="idx"
                        class="relative w-16 h-16 rounded-xl bg-surface-2 shrink-0 border border-border overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all group shadow-2xs"
                        @click="openMediaPreview(img, 'image')"
                      >
                        <img
                          :src="img"
                          alt="Foto Barang"
                          class="w-full h-full object-cover"
                          @error="(e: any) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden') }"
                        />
                        <div class="hidden w-full h-full flex items-center justify-center bg-surface-2 text-text-muted">
                          <ImagePlus class="w-5 h-5" />
                        </div>
                      </div>

                      <div
                        v-if="activeComplain.video"
                        class="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-black cursor-pointer group hover:opacity-95 active:scale-[0.98] transition-all shadow-2xs shrink-0"
                        @click="openMediaPreview(activeComplain.video, 'video')"
                      >
                        <video
                          :src="activeComplain.video + '#t=0.1'"
                          preload="metadata"
                          class="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity pointer-events-none"
                          muted
                          playsinline
                        ></video>
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div class="w-7 h-7 rounded-full bg-white text-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <Play class="w-3.5 h-3.5 fill-primary ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- /Left Column -->

              <!-- Right Column -->
              <div class="space-y-4">
                <!-- 4. Alasan & Bukti Masalah (Shown on Right when NO return shipping yet) -->
                <div v-if="!hasReturnShipping" class="p-3.5 sm:p-4 rounded-xl border border-border bg-white space-y-3 text-xs font-outfit shadow-2xs">
                  <div>
                    <span class="text-text-muted text-[11px] block font-medium">Alasan Pengembalian:</span>
                    <p class="font-semibold text-text text-xs sm:text-sm mt-0.5">{{ activeComplain.reason }}</p>
                  </div>

                  <div v-if="activeComplain.message">
                    <span class="text-text-muted text-[11px] block mb-1 font-medium">Keterangan Pembeli:</span>
                    <p class="p-2.5 rounded-lg bg-surface-2 text-text leading-relaxed text-xs border border-border/50">
                      {{ activeComplain.message }}
                    </p>
                  </div>

                  <!-- Foto & Video Bukti Media Grid -->
                  <div v-if="activeComplain.images.length > 0 || activeComplain.video" class="pt-2 border-t border-border/60 space-y-2">
                    <span class="text-text-muted text-[11px] block font-medium">Bukti Foto & Video:</span>
                    <div class="flex flex-wrap items-center gap-2.5">
                      <div
                        v-for="(img, idx) in activeComplain.images"
                        :key="idx"
                        class="relative w-16 h-16 rounded-xl bg-surface-2 shrink-0 border border-border overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all group shadow-2xs"
                        @click="openMediaPreview(img, 'image')"
                      >
                        <img
                          :src="img"
                          alt="Foto Barang"
                          class="w-full h-full object-cover"
                          @error="(e: any) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden') }"
                        />
                        <div class="hidden w-full h-full flex items-center justify-center bg-surface-2 text-text-muted">
                          <ImagePlus class="w-5 h-5" />
                        </div>
                      </div>

                      <div
                        v-if="activeComplain.video"
                        class="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-black cursor-pointer group hover:opacity-95 active:scale-[0.98] transition-all shadow-2xs shrink-0"
                        @click="openMediaPreview(activeComplain.video, 'video')"
                      >
                        <video
                          :src="activeComplain.video + '#t=0.1'"
                          preload="metadata"
                          class="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity pointer-events-none"
                          muted
                          playsinline
                        ></video>
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div class="w-7 h-7 rounded-full bg-white text-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <Play class="w-3.5 h-3.5 fill-primary ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 5. Alamat Pengembalian (if available) -->
                <div v-if="activeComplain.returnAddress" class="p-3.5 sm:p-4 rounded-xl bg-surface-2 border border-border space-y-2 shadow-2xs">
                  <div class="flex items-center gap-2">
                    <MapPin class="w-4 h-4 text-primary shrink-0" />
                    <h4 class="font-outfit font-bold text-xs sm:text-sm text-text">
                      Alamat Pengembalian
                    </h4>
                  </div>
                  <div class="text-xs font-outfit pl-6 space-y-0.5 text-text">
                    <p class="font-semibold">
                      {{ activeComplain.returnAddress.contact_name || activeComplain.returnAddress.name }}
                      <span v-if="activeComplain.returnAddress.contact_phone || activeComplain.returnAddress.phone" class="text-text-muted">
                        • {{ activeComplain.returnAddress.contact_phone || activeComplain.returnAddress.phone }}
                      </span>
                    </p>
                    <p class="text-text-muted leading-relaxed">
                      {{ activeComplain.returnAddress.address }}
                    </p>
                    <p class="text-text-muted">
                      {{ [activeComplain.returnAddress.subdistrict, activeComplain.returnAddress.city, activeComplain.returnAddress.province, activeComplain.returnAddress.postal].filter(Boolean).join(', ') }}
                    </p>
                  </div>
                </div>

                <!-- 6. Detail Resi Pengembalian Barang (if in return ship) -->
                <div
                  v-if="activeComplain.returnWaybill"
                  class="p-3.5 sm:p-4 rounded-xl bg-surface-2 border border-border space-y-2.5 text-xs font-outfit shadow-2xs"
                >
                  <div class="font-bold text-text flex items-center gap-2">
                    <Truck class="w-4 h-4 text-primary shrink-0" />
                    <span class="text-xs sm:text-sm">Detail Pengembalian Barang</span>
                  </div>
                  <div class="pl-6 space-y-2">
                    <div>
                      <span class="text-text-muted text-[11px]">Kurir Pengembalian:</span>
                      <p class="font-semibold text-xs text-text">{{ activeComplain.returnCourierName || 'Kurir Pengembalian' }}</p>
                      <p v-if="activeComplain.detailNote" class="text-text-muted text-[11px] mt-0.5">
                        {{ activeComplain.detailNote }}
                      </p>
                    </div>
                    <div class="flex items-center justify-between pt-1 border-t border-border/60">
                      <div>
                        <span class="text-text-muted text-[11px]">Nomor Resi:</span>
                        <p class="font-semibold font-mono text-xs text-text">{{ activeComplain.returnWaybill }}</p>
                      </div>
                      <button
                        type="button"
                        class="text-xs font-semibold text-primary hover:underline cursor-pointer"
                        @click="copyWaybillNumber(activeComplain.returnWaybill)"
                      >
                        {{ waybillCopied ? 'Disalin!' : 'Salin Resi' }}
                      </button>
                    </div>
                    <div v-if="activeComplain.returnImage" class="pt-1">
                      <span class="text-text-muted text-[11px] block mb-1">Bukti Resi:</span>
                      <div
                        class="w-16 h-16 rounded-lg bg-surface-2 shrink-0 border border-border overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 shadow-2xs"
                        @click="openMediaPreview(activeComplain.returnImage, 'image')"
                      >
                        <img
                          :src="activeComplain.returnImage"
                          alt="Bukti Resi"
                          class="w-full h-full object-cover"
                          @error="(e: any) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden') }"
                        />
                        <div class="hidden w-full h-full flex items-center justify-center bg-surface-2 text-text-muted">
                          <ImagePlus class="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 7. Complain Decline Banner (if rejected) -->
                <div
                  v-if="activeComplain.declineReason"
                  class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-outfit space-y-1 shadow-2xs"
                >
                  <div class="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle class="w-4 h-4 text-amber-800 shrink-0" />
                    <span>Pengajuan Komplain Ditolak</span>
                  </div>
                  <p class="pl-5.5 text-amber-700 leading-relaxed text-xs">
                    Alasan: "{{ activeComplain.declineReason }}"
                  </p>
                </div>
              </div>
              <!-- /Right Column -->
            </div>
            <!-- /Grid 2-Columns -->

            <!-- Bottom safe spacing buffer -->
            <div class="h-2 shrink-0"></div>
          </div>

          <!-- STEP 4: WAYBILL INPUT -->
          <div v-else-if="mode === 'waybill'" class="space-y-4">
            <p class="text-xs text-text-muted">
              Masukkan kurir dan nomor resi pengiriman kembali barang ke penjual:
            </p>

            <!-- Courier Selection -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-text">
                Pilih Kurir <span class="text-red-500">*</span>
              </label>
              <select
                v-model="selectedCourier"
                class="w-full p-3 rounded-xl border border-border text-xs font-outfit bg-white text-text focus:border-primary"
              >
                <option :value="null" disabled>Pilih Kurir Pengembalian</option>
                <option v-for="c in couriers" :key="c._id" :value="c">
                  {{ c.name }} ({{ c.code }})
                </option>
              </select>
            </div>

            <!-- Waybill Number -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-text">
                Nomor Resi <span class="text-red-500">*</span>
              </label>
              <input
                v-model="waybillNumber"
                type="text"
                placeholder="Contoh: JP123456789"
                class="w-full p-3 rounded-xl border border-border text-xs font-outfit bg-white text-text focus:border-primary font-mono uppercase"
              />
            </div>

            <!-- Receipt Photo -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-text">
                Foto Bukti Resi <span class="text-red-500">*</span>
              </label>
              <div v-if="waybillImage" class="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
                <img :src="waybillImage" alt="Resi" class="w-full h-full object-cover" />
                <button
                  type="button"
                  class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
                  @click="waybillImage = ''"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
              <button
                v-else
                type="button"
                class="w-full h-20 rounded-xl border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-text-muted hover:text-primary transition-colors cursor-pointer bg-surface-2"
                @click="fileInputWaybillRef?.click()"
              >
                <ImagePlus class="w-5 h-5" />
                <span class="text-xs">Unggah Bukti Struk/Resi</span>
              </button>
              <input
                ref="fileInputWaybillRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleWaybillImageSelect"
              />
            </div>

            <!-- Submit Waybill -->
            <div class="pt-2">
              <button
                type="button"
                :disabled="!selectedCourier || !waybillNumber.trim() || !waybillImage || isSubmitting"
                class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-sm transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shadow-xs"
                @click="handleWaybillSubmit"
              >
                <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin mr-2" />
                <span>Kirim Resi Pengembalian</span>
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Modal Footer (Fixed at bottom) -->
      <!-- SELECT MODE FOOTER -->
      <div
        v-if="mode === 'select' && !isLoading"
        class="px-5 py-3.5 border-t border-border bg-white flex items-center justify-between shrink-0"
      >
        <div>
          <p class="text-[11px] text-text-muted">Total Nilai Komplain:</p>
          <p class="font-outfit font-bold text-sm text-primary">
            Rp {{ formatNumber(totalComplainPrice) }}
          </p>
        </div>
        <button
          type="button"
          :disabled="totalComplainPrice <= 0"
          class="px-6 h-10 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
          @click="goToForm"
        >
          Lanjutkan
        </button>
      </div>

      <!-- DETAIL MODE FOOTER -->
      <div
        v-else-if="mode === 'detail' && !isLoading"
        class="px-5 py-3.5 border-t border-border bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
      >
        <!-- Support Link -->
        <button
          type="button"
          class="text-xs text-text-muted hover:text-primary transition-colors cursor-pointer text-center sm:text-left order-2 sm:order-1"
          @click="openBekaskuCenterHelp"
        >
          Punya kendala komplain? Hubungi BekasKu Center
        </button>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end order-1 sm:order-2">
          <!-- Seller Actions: Accept or Decline -->
          <template v-if="isSeller && (activeComplain.statusCode === 'complain' || activeComplain.statusCode === 'oncomplain')">
            <button
              type="button"
              :disabled="isSubmitting"
              class="flex-1 sm:flex-initial px-5 h-10 rounded-xl border border-red-500 text-red-600 hover:bg-red-50 font-outfit text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
              @click="showDeclineModal = true"
            >
              Tolak Komplain
            </button>
            <button
              type="button"
              :disabled="isSubmitting"
              class="flex-1 sm:flex-initial px-6 h-10 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              @click="handleAcceptComplain"
            >
              <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
              <span>Terima Komplain</span>
            </button>
          </template>

          <!-- Buyer Action: Input Waybill when packed_complaining -->
          <template v-else-if="!isSeller && activeComplain.statusCode === 'packed_complaining'">
            <button
              type="button"
              class="w-full sm:w-auto px-6 h-10 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit text-xs font-semibold cursor-pointer transition-colors"
              @click="openWaybillInput"
            >
              Input Resi Pengembalian
            </button>
          </template>

          <!-- Seller Action: Finish Return when onship_return -->
          <template v-else-if="isSeller && activeComplain.statusCode === 'onship_return'">
            <button
              type="button"
              :disabled="isSubmitting"
              class="w-full sm:w-auto px-6 h-10 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              @click="handleFinishReturnSubmit"
            >
              <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
              <span>Selesaikan Pengembalian</span>
            </button>
          </template>

          <!-- Default Close Button if no action available -->
          <template v-else>
            <button
              type="button"
              class="px-5 h-9 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-2 cursor-pointer transition-colors"
              @click="close"
            >
              Tutup
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Decline Input Modal (Seller) -->
    <div
      v-if="showDeclineModal"
      class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      @click.self="showDeclineModal = false"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3 shadow-2xl border border-border">
        <h4 class="font-outfit font-bold text-sm text-text">Tolak Komplain</h4>
        <p class="text-xs text-text-muted">
          Tuliskan alasan penolakan komplain ini kepada pembeli:
        </p>
        <textarea
          v-model="declineReasonInput"
          rows="3"
          placeholder="Alasan penolakan..."
          class="w-full p-3 rounded-xl border border-border focus:border-primary text-xs font-outfit resize-none"
        ></textarea>
        <div class="flex items-center gap-2 pt-1">
          <button
            type="button"
            class="flex-1 h-9 rounded-xl border border-border text-xs font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
            @click="showDeclineModal = false"
          >
            Batal
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            class="flex-1 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
            @click="handleDeclineComplainSubmit"
          >
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span>Tolak Sekarang</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Finish Return Confirmation Modal (Seller) -->
    <div
      v-if="showFinishConfirmModal"
      class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      @click.self="showFinishConfirmModal = false"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-border">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle class="w-5 h-5" />
          </div>
          <div>
            <h4 class="font-outfit font-bold text-sm text-text">Selesaikan Komplain</h4>
            <p class="text-xs text-text-muted mt-0.5">
              Apakah Anda ingin menyelesaikan komplain ini? Dana penjualan akan dikembalikan ke pembeli.
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 pt-1">
          <button
            type="button"
            class="flex-1 h-9 rounded-xl border border-border text-xs font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
            @click="showFinishConfirmModal = false"
          >
            Batal
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            class="flex-1 h-9 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
            @click="confirmFinishReturn"
          >
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span>Selesaikan Sekarang</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Media Lightbox / Fullscreen Preview Modal -->
    <div
      v-if="previewMedia"
      class="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-150"
      @click="closeMediaPreview"
    >
      <div class="relative max-w-3xl w-full flex flex-col items-center justify-center" @click.stop>
        <div class="w-full flex items-center justify-between pb-3 text-white">
          <span class="text-xs font-outfit font-medium text-white/90">
            {{ previewMedia.type === 'video' ? 'Video Bukti Unboxing' : 'Foto Bukti' }}
          </span>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            @click="closeMediaPreview"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <video
          v-if="previewMedia.type === 'video'"
          :src="previewMedia.url"
          controls
          autoplay
          playsinline
          class="max-w-full max-h-[80vh] w-auto rounded-2xl bg-black shadow-2xl border border-white/10"
        ></video>
        <img
          v-else
          :src="previewMedia.url"
          alt="Bukti Komplain"
          class="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/10"
        />
      </div>
    </div>
  </div>
</Teleport>
</template>

