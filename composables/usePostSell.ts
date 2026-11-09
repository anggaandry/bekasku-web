import { ref, computed, watch, onMounted } from 'vue'
import {
  API_CATEGORY_LIST,
  API_SUBCATEGORY_LIST,
  API_SUBCATEGORY_TYPE_LIST,
  API_POST_SELL_INIT,
  API_POST_SELL_SUBMIT,
  API_ASK_PRICE_AI,
  API_PRODUCT_DETAIL,
  SELL_METHOD_DIRECT,
  SELL_METHOD_NEEDED,
  SELL_METHOD_SERVICE,
} from '~/utils/constants'
import { formatRupiah } from '~/utils/format'
import type {
  CategoryItem,
  SubcategoryItem,
  TypeCategoryItem,
  DynamicFormField,
  DynamicFormAnswer,
  PostAddressData,
  PostSellInitResponse,
  AiPriceResult,
  AiPostAnalysisResult,
  PostSellSubmitPayload,
  UploadedImage,
} from '~/types/post'
import { useAuthStore } from '~/stores/auth'
import { useAddress } from '~/composables/useAddress'

export type { UploadedImage }

interface RawCategoryResponse {
  result?: CategoryItem[] | { docs?: CategoryItem[] }
  docs?: CategoryItem[]
}

interface RawSubcategoryResponse {
  result?: SubcategoryItem[] | { docs?: SubcategoryItem[] }
  docs?: SubcategoryItem[]
}

interface RawTypeCategoryResponse {
  result?: TypeCategoryItem[] | { docs?: TypeCategoryItem[] }
  docs?: TypeCategoryItem[]
}

interface ExistingProductDetail {
  title?: string
  description?: string
  price?: number | string
  stock?: number | string
  weight?: number | string
  length?: number | ''
  width?: number | ''
  height?: number | ''
  take_method?: number
  free_delivery?: boolean
  total_free_delivery?: number | string
  address_data?: PostAddressData
  image?: string[]
  video?: string
  category_id?: string
  subcategory_id?: string
  type_category_id?: string
}

interface ProductDetailResponse {
  result?: ExistingProductDetail & { product?: ExistingProductDetail }
  product?: ExistingProductDetail
}

const DRAFT_STORAGE_KEY = 'bekasku_post_sell_draft_v1'

export function usePostSell(
  editProductId?: string,
  initialSellMethod: number = SELL_METHOD_DIRECT,
) {
  const api = useApi()
  const authStore = useAuthStore()
  const { showNotification } = useNotification()
  const addressComposable = useAddress()

  // State
  const loading = ref(false)
  const isSubmitting = ref(false)
  const isAiPriceLoading = ref(false)
  const aiPriceResult = ref<AiPriceResult | null>(null)

  // Categories
  const categories = ref<CategoryItem[]>([])
  const subcategories = ref<SubcategoryItem[]>([])
  const typeCategories = ref<TypeCategoryItem[]>([])
  const isCategoriesLoading = ref(false)
  const isSubcategoriesLoading = ref(false)

  // Form Fields
  const productId = ref<string>(editProductId || '')
  const sellMethod = ref<number>(initialSellMethod)
  const selectedCategory = ref<CategoryItem | null>(null)
  const selectedSubcategory = ref<SubcategoryItem | null>(null)
  const selectedTypeCategory = ref<TypeCategoryItem | null>(null)
  const categoryCharge = ref<number>(3) // e.g. 3%

  const title = ref('')
  const description = ref('')
  const price = ref<number>(0)
  const stock = ref<number>(1)
  const weight = ref<number>(0.1) // in kg
  const length = ref<number | ''>('')
  const width = ref<number | ''>('')
  const height = ref<number | ''>('')

  // Delivery & Methods
  const directMeet = ref(true) // COD
  const deliveryCourrier = ref(true) // Kurir
  const freeDelivery = ref(false) // Bebas Ongkir
  const totalFreeDelivery = ref<number>(0)

  // Address
  const address = ref<PostAddressData | null>(null)

  // Media
  const images = ref<UploadedImage[]>([])
  const video = ref<string>('')
  const isImageProcessing = ref(false)
  const imageProcessProgress = ref({
    current: 0,
    total: 0,
    message: '',
  })

  // Dynamic Specs
  const dynamicForms = ref<DynamicFormField[]>([])
  const dynamicAnswers = ref<DynamicFormAnswer[]>([])

  // Validation Errors
  const errors = ref<Record<string, string>>({})

  // Computed
  const isEditMode = computed(() => Boolean(productId.value))
  const maxPhotos = computed(() => (authStore.user?.subscribe_type === 'vip' ? 20 : 5))
  const serviceFeePercent = computed(() => categoryCharge.value || 3)
  const estimatedServiceFee = computed(() => {
    if (!price.value || price.value <= 0) return 0
    return Math.round((price.value * serviceFeePercent.value) / 100)
  })
  const estimatedNetEarnings = computed(() => {
    if (!price.value || price.value <= 0) return 0
    let net = price.value - estimatedServiceFee.value
    if (freeDelivery.value && totalFreeDelivery.value > 0) {
      net -= totalFreeDelivery.value
    }
    return Math.max(0, net)
  })

  // Load Categories
  async function fetchCategories() {
    isCategoriesLoading.value = true
    try {
      const isService = sellMethod.value === SELL_METHOD_SERVICE
      const res = await api.post<RawCategoryResponse>(
        API_CATEGORY_LIST,
        isService ? { service: true, lang: 'id' } : { lang: 'id' }
      )
      const rawList = Array.isArray(res?.result)
        ? res.result
        : Array.isArray(res?.result?.docs)
          ? res.result.docs
          : Array.isArray(res?.docs)
            ? res.docs
            : []
      categories.value = rawList.map((c: CategoryItem) => ({
        _id: String(c._id || c.id || ''),
        name_id: c.name_id || c.name || '',
        name_en: c.name_en || c.name || '',
        image: c.image,
      }))
    } catch (err) {
      console.error('[usePostSell] Failed to fetch categories:', err)
    } finally {
      isCategoriesLoading.value = false
    }
  }

  // Load Subcategories
  async function fetchSubcategories(catId: string) {
    if (!catId) {
      subcategories.value = []
      return
    }
    isSubcategoriesLoading.value = true
    try {
      const isService = sellMethod.value === SELL_METHOD_SERVICE
      const res = await api.post<RawSubcategoryResponse>(API_SUBCATEGORY_LIST, {
        category_id: catId,
        lang: 'id',
        ...(isService ? { service: true } : {}),
      })
      const rawList = Array.isArray(res?.result)
        ? res.result
        : Array.isArray(res?.result?.docs)
          ? res.result.docs
          : Array.isArray(res?.docs)
            ? res.docs
            : []
      subcategories.value = rawList.map((s: SubcategoryItem) => ({
        _id: String(s._id || s.id || ''),
        category_id: catId,
        name_id: s.name_id || s.name || '',
        name_en: s.name_en || s.name || '',
        charge: typeof s.charge === 'number' ? s.charge : 3,
        form: s.form || [],
      }))
    } catch (err) {
      console.error('[usePostSell] Failed to fetch subcategories:', err)
    } finally {
      isSubcategoriesLoading.value = false
    }
  }

  // Select Category
  async function selectCategory(cat: CategoryItem) {
    selectedCategory.value = cat
    selectedSubcategory.value = null
    selectedTypeCategory.value = null
    typeCategories.value = []
    dynamicForms.value = []
    dynamicAnswers.value = []
    await fetchSubcategories(cat._id)
  }

  // Select Subcategory & Init Form
  async function selectSubcategory(sub: SubcategoryItem) {
    selectedSubcategory.value = sub
    selectedTypeCategory.value = null
    categoryCharge.value = sub.charge || 3

    // Load Type categories (if any)
    try {
      const typeRes = await api.post<RawTypeCategoryResponse>(API_SUBCATEGORY_TYPE_LIST, {
        subcategory_id: sub._id,
      })
      const rawTypes = Array.isArray(typeRes?.result)
        ? typeRes.result
        : Array.isArray(typeRes?.result?.docs)
          ? typeRes.result.docs
          : Array.isArray(typeRes?.docs)
            ? typeRes.docs
            : []
      typeCategories.value = rawTypes.map((t: TypeCategoryItem) => ({
        _id: String(t._id || t.id || ''),
        subcategory_id: sub._id,
        name_id: t.name_id || t.name || '',
        name_en: t.name_en || t.name || '',
      }))
    } catch (err) {
      typeCategories.value = []
    }

    // Call /post/sell/init
    await initSubcategoryForm(sub._id)
  }

  async function initSubcategoryForm(subId: string) {
    loading.value = true
    try {
      const res = await api.post<{ message: string; result: PostSellInitResponse }>(API_POST_SELL_INIT, {
        subcategory_id: subId,
        product_id: productId.value || undefined,
        lang: 'id',
      })

      const data = res?.result
      if (data) {
        if (!address.value && data.address) {
          address.value = data.address
        }
        if (data.charge) {
          categoryCharge.value = data.charge
        }
        if (Array.isArray(data.form)) {
          dynamicForms.value = data.form
        }
        if (Array.isArray(data.form_answer)) {
          dynamicAnswers.value = data.form_answer
        }
      }
    } catch (err) {
      console.error('[usePostSell] Failed to init subcategory form:', err)
    } finally {
      loading.value = false
    }
  }

  // AI Price
  async function askAiPrice(): Promise<boolean> {
    if (!title.value.trim()) {
      showNotification({
        type: 'error',
        message: 'Masukkan judul barang terlebih dahulu untuk estimasi harga AI.',
      })
      return false
    }

    isAiPriceLoading.value = true
    try {
      const res = await api.post<{ message: string; result: AiPriceResult }>(API_ASK_PRICE_AI, {
        title: title.value.trim(),
        description: description.value.trim() || title.value.trim(),
        lang: 'id',
      })
      if (res?.result?.price) {
        aiPriceResult.value = res.result
        return true
      }
      return false
    } catch (err: unknown) {
      showNotification({
        type: 'error',
        message: 'Gagal mendapatkan estimasi harga AI. Silakan coba lagi.',
      })
      return false
    } finally {
      isAiPriceLoading.value = false
    }
  }

  function applyAiPrice() {
    if (aiPriceResult.value?.price) {
      price.value = aiPriceResult.value.price
      showNotification({
        type: 'success',
        message: `Harga rekomendasi AI diterapkan: ${formatRupiah(price.value)}`,
      })
    }
  }

  // Media Handling (Compress to Base64 matching Mobile V3 ImageHelper)
  async function addImageFiles(files: FileList | File[]) {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    const remainingSlots = maxPhotos.value - images.value.length
    if (remainingSlots <= 0) {
      showNotification({
        type: 'error',
        message: `Batas maksimal foto adalah ${maxPhotos.value} foto.`,
      })
      return
    }

    const filesToProcess = fileArray.slice(0, remainingSlots)
    if (fileArray.length > remainingSlots) {
      showNotification({
        type: 'warning',
        message: `Hanya ${remainingSlots} foto yang ditambahkan karena batas maksimal terlampaui.`,
      })
    }

    isImageProcessing.value = true
    imageProcessProgress.value = {
      current: 0,
      total: filesToProcess.length,
      message: 'Menyiapkan kompresi gambar...',
    }

    try {
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i]
        if (!file) continue

        imageProcessProgress.value = {
          current: i + 1,
          total: filesToProcess.length,
          message: `Mengompres gambar (${i + 1}/${filesToProcess.length})...`,
        }

        const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(file.name)
        if (!isImage) {
          showNotification({
            type: 'warning',
            message: `File "${file.name}" bukan format gambar yang valid.`,
          })
          continue
        }

        try {
          const processed = await compressImageFile(file)
          images.value.push({
            id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            url: processed.dataUrl,
            base64: processed.base64,
          })
        } catch (err: unknown) {
          console.error('[usePostSell] Failed to process image:', err)
          const msg = err instanceof Error ? err.message : 'Format tidak didukung'
          showNotification({
            type: 'error',
            message: `Gagal memproses gambar "${file.name}": ${msg}`,
          })
        }
      }
    } finally {
      isImageProcessing.value = false
      imageProcessProgress.value = { current: 0, total: 0, message: '' }
    }
  }

  function removeImage(index: number) {
    images.value.splice(index, 1)
  }

  function setCoverImage(index: number) {
    if (index > 0 && index < images.value.length) {
      const target = images.value[index]
      if (target) {
        images.value.splice(index, 1)
        images.value.unshift(target)
      }
    }
  }

  async function compressImageFile(file: File): Promise<{ dataUrl: string; base64: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Gagal membaca file gambar'))
      reader.onload = () => {
        const resultStr = String(reader.result || '')
        const img = new Image()
        img.onerror = () => reject(new Error('Format gambar tidak didukung'))
        img.onload = () => {
          // Align with mobile v3 ImageHelper: max dimension 1080px, quality 80% (0.8)
          const maxDim = 1080
          let width = img.width
          let height = img.height
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            const rawBase64 = resultStr.includes(',') ? resultStr.split(',')[1] || '' : resultStr
            resolve({ dataUrl: resultStr, base64: rawBase64 })
            return
          }

          // Solid white backdrop prevents transparent PNGs from turning black
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)

          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          const base64 = dataUrl.split(',')[1] || ''
          resolve({ dataUrl, base64 })
        }
        img.src = resultStr
      }
      reader.readAsDataURL(file)
    })
  }

  // Draft persistence
  function saveDraft() {
    if (isEditMode.value || !import.meta.client) return
    const draftData = {
      title: title.value,
      description: description.value,
      price: price.value,
      stock: stock.value,
      weight: weight.value,
      length: length.value,
      width: width.value,
      height: height.value,
      directMeet: directMeet.value,
      deliveryCourrier: deliveryCourrier.value,
      freeDelivery: freeDelivery.value,
      totalFreeDelivery: totalFreeDelivery.value,
      categoryId: selectedCategory.value?._id,
      subcategoryId: selectedSubcategory.value?._id,
      typeCategoryId: selectedTypeCategory.value?._id,
      timestamp: Date.now(),
    }
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData))
    } catch (e) {
      // ignore
    }
  }

  function restoreDraft() {
    if (isEditMode.value || !import.meta.client) return
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (!raw) return
      const draft = JSON.parse(raw)
      if (draft && Date.now() - draft.timestamp < 7 * 24 * 60 * 60 * 1000) {
        if (draft.title) title.value = draft.title
        if (draft.description) description.value = draft.description
        if (draft.price) price.value = draft.price
        if (draft.stock) stock.value = draft.stock
        if (draft.weight) weight.value = draft.weight
        if (draft.length) length.value = draft.length
        if (draft.width) width.value = draft.width
        if (draft.height) height.value = draft.height
        if (draft.directMeet !== undefined) directMeet.value = draft.directMeet
        if (draft.deliveryCourrier !== undefined) deliveryCourrier.value = draft.deliveryCourrier
        if (draft.freeDelivery !== undefined) freeDelivery.value = draft.freeDelivery
        if (draft.totalFreeDelivery !== undefined) totalFreeDelivery.value = draft.totalFreeDelivery
      }
    } catch (e) {
      // ignore
    }
  }

  function clearDraft() {
    if (import.meta.client) {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    }
    title.value = ''
    description.value = ''
    price.value = 0
    stock.value = 1
    weight.value = 0.1
    length.value = ''
    width.value = ''
    height.value = ''
    images.value = []
    video.value = ''
    selectedCategory.value = null
    selectedSubcategory.value = null
    selectedTypeCategory.value = null
    dynamicForms.value = []
    dynamicAnswers.value = []
    errors.value = {}
    showNotification({
      type: 'info',
      message: 'Draf formulir berhasil dibersihkan.',
    })
  }

  // Pre-fill Edit Mode
  async function loadExistingProduct(prodId: string) {
    loading.value = true
    try {
      const res = await api.post<ProductDetailResponse>(API_PRODUCT_DETAIL, { id: prodId, lang: 'id' })
      const prod = res?.result?.product || res?.product || res?.result
      if (!prod) throw new Error('Produk tidak ditemukan')

      productId.value = prodId
      title.value = prod.title || ''
      description.value = prod.description || ''
      price.value = Number(prod.price) || 0
      stock.value = Number(prod.stock) || 1
      weight.value = Number(prod.weight) || 0.1
      length.value = prod.length || ''
      width.value = prod.width || ''
      height.value = prod.height || ''

      directMeet.value = prod.take_method === 0 || prod.take_method === 1
      deliveryCourrier.value = prod.take_method === 0 || prod.take_method === 2
      freeDelivery.value = Boolean(prod.free_delivery)
      totalFreeDelivery.value = Number(prod.total_free_delivery) || 0

      // Address
      if (prod.address_data) {
        address.value = prod.address_data
      }

      // Images
      if (Array.isArray(prod.image)) {
        images.value = prod.image.map((imgUrl: string, idx: number) => ({
          id: `existing_${idx}`,
          url: sanitizeMediaUrl(imgUrl, ''),
          base64: imgUrl,
          isExisting: true,
        }))
      }

      // Video
      if (prod.video) {
        video.value = prod.video
      }

      // Categories
      if (prod.category_id) {
        const cat = categories.value.find(c => String(c._id) === String(prod.category_id))
        if (cat) selectedCategory.value = cat
        await fetchSubcategories(prod.category_id)
      }
      if (prod.subcategory_id) {
        const sub = subcategories.value.find(s => String(s._id) === String(prod.subcategory_id))
        if (sub) {
          selectedSubcategory.value = sub
          categoryCharge.value = sub.charge || 3
        }
        await initSubcategoryForm(prod.subcategory_id)
      }
      if (prod.type_category_id && typeCategories.value.length > 0) {
        const tc = typeCategories.value.find(t => String(t._id) === String(prod.type_category_id))
        if (tc) selectedTypeCategory.value = tc
      }
    } catch (err: unknown) {
      showNotification({
        type: 'error',
        message: 'Gagal memuat data produk untuk diedit.',
      })
    } finally {
      loading.value = false
    }
  }

  function isFieldRequired(field: DynamicFormField): boolean {
    if (String(field.type) === '1') return true
    const lower = (field.name_id || field.name || '').toLowerCase()
    if (lower.includes('opsional') || lower.includes('optional') || lower.includes('minus') || lower.includes('catatan')) {
      return false
    }
    return true
  }

  // Form Validation
  function validateForm(): boolean {
    const newErrors: Record<string, string> = {}
    const isNeeded = sellMethod.value === SELL_METHOD_NEEDED
    const isService = sellMethod.value === SELL_METHOD_SERVICE

    if (images.value.length === 0) {
      newErrors.images = isNeeded
        ? 'Minimal 1 foto barang yang dibutuhkan wajib diunggah.'
        : isService
          ? 'Minimal 1 foto jasa wajib diunggah.'
          : 'Minimal 1 foto produk wajib diunggah.'
    }

    if (!title.value.trim()) {
      newErrors.title = isNeeded
        ? 'Judul barang yang dibutuhkan wajib diisi.'
        : isService
          ? 'Judul jasa wajib diisi.'
          : 'Judul barang wajib diisi.'
    } else if (title.value.trim().length < 5) {
      newErrors.title = 'Judul minimal 5 karakter.'
    } else if (title.value.trim().length > 70) {
      newErrors.title = 'Judul maksimal 70 karakter.'
    }

    if (!selectedCategory.value) {
      newErrors.category = 'Kategori wajib dipilih.'
    }
    if (!selectedSubcategory.value) {
      newErrors.subcategory = 'Subkategori wajib dipilih.'
    }

    if (!price.value || price.value <= 0) {
      newErrors.price = isNeeded
        ? 'Budget harus lebih dari Rp 0.'
        : isService
          ? 'Tarif jasa harus lebih dari Rp 0.'
          : 'Harga barang harus lebih dari Rp 0.'
    }

    if (!isService && (!stock.value || stock.value < 1)) {
      newErrors.stock = isNeeded ? 'Jumlah dibutuhkan minimal 1.' : 'Stok minimal 1.'
    }

    if (!address.value) {
      newErrors.address = isNeeded
        ? 'Lokasi kebutuhan wajib ditentukan.'
        : isService
          ? 'Lokasi jasa wajib ditentukan.'
          : 'Alamat asal pengiriman wajib ditentukan.'
    }

    if (!isNeeded && !isService && !directMeet.value && !deliveryCourrier.value) {
      newErrors.shipping = 'Pilih minimal 1 metode transaksi (Kurir atau COD).'
    }

    if (!description.value.trim()) {
      newErrors.description = isNeeded
        ? 'Deskripsi barang yang dibutuhkan wajib diisi.'
        : isService
          ? 'Deskripsi jasa wajib diisi.'
          : 'Deskripsi barang wajib diisi.'
    } else if (description.value.trim().length < 10) {
      newErrors.description = 'Deskripsi minimal 10 karakter.'
    }

    // Dynamic Specifications Validation
    if (!isNeeded && !isService && dynamicForms.value && dynamicForms.value.length > 0) {
      let missingSpecs = 0
      for (const field of dynamicForms.value) {
        if (!isFieldRequired(field)) continue
        const fieldName = field.name_id || field.name || 'Spesifikasi'
        const ans = dynamicAnswers.value.find((a) => String(a.id) === String(field.id))

        if (String(field.type) === '1') {
          const hasAnswer = Boolean(
            ans &&
            ans.answer_id !== undefined &&
            ans.answer_id !== null &&
            String(ans.answer_id).trim() !== '' &&
            ans.answer &&
            ans.answer.trim().length > 0
          )
          if (!hasAnswer) {
            newErrors['dynamic_' + field.id] = `${fieldName} wajib dipilih.`
            missingSpecs++
          }
        } else {
          const hasText = Boolean(ans && ans.answer && ans.answer.trim().length > 0)
          if (!hasText) {
            newErrors['dynamic_' + field.id] = `${fieldName} wajib diisi.`
            missingSpecs++
          }
        }
      }
      if (missingSpecs > 0) {
        newErrors.specs = `Lengkapi ${missingSpecs} kolom spesifikasi produk.`
      }
    }

    errors.value = newErrors
    return Object.keys(newErrors).length === 0
  }

  function scrollToFirstError() {
    if (import.meta.client) {
      setTimeout(() => {
        const target =
          document.querySelector('.border-danger') ||
          document.querySelector('[data-error="true"]') ||
          document.querySelector('.text-danger')
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' })
          const input = target.matches('input, select, textarea')
            ? target
            : target.querySelector('input, select, textarea')
          if (input) {
            ;(input as HTMLElement).focus()
          }
        }
      }, 100)
    }
  }

  const isFormValid = computed(() => {
    const isNeeded = sellMethod.value === SELL_METHOD_NEEDED
    const isService = sellMethod.value === SELL_METHOD_SERVICE

    if (images.value.length === 0) return false
    if (!title.value.trim() || title.value.trim().length < 5 || title.value.trim().length > 70) return false
    if (!selectedCategory.value || !selectedSubcategory.value) return false
    if (!price.value || price.value <= 0) return false
    if (!isService && (!stock.value || stock.value < 1)) return false
    if (!address.value) return false
    if (!isNeeded && !isService && !directMeet.value && !deliveryCourrier.value) return false
    if (!description.value.trim() || description.value.trim().length < 10) return false

    // Check dynamic specs
    if (!isNeeded && !isService && dynamicForms.value && dynamicForms.value.length > 0) {
      for (const field of dynamicForms.value) {
        if (!isFieldRequired(field)) continue
        const ans = dynamicAnswers.value.find((a) => String(a.id) === String(field.id))
        if (String(field.type) === '1') {
          if (!ans || ans.answer_id === undefined || ans.answer_id === null || String(ans.answer_id).trim() === '' || !ans.answer) {
            return false
          }
        } else {
          if (!ans || !ans.answer || !ans.answer.trim()) {
            return false
          }
        }
      }
    }

    return true
  })

  // Submit Product
  async function submitProduct(): Promise<string | null> {
    if (!validateForm()) {
      const firstError = Object.values(errors.value)[0]
      showNotification({
        type: 'error',
        message: firstError || 'Mohon lengkapi seluruh formulir yang wajib diisi.',
      })
      scrollToFirstError()
      return null
    }

    if (!address.value) return null

    isSubmitting.value = true
    try {
      const isNeeded = sellMethod.value === SELL_METHOD_NEEDED
      const isService = sellMethod.value === SELL_METHOD_SERVICE

      const subCatId = selectedSubcategory.value!._id
      const payload: PostSellSubmitPayload = {
        product_id: productId.value || undefined,
        title: title.value.trim(),
        description: description.value.trim(),
        category_id: selectedCategory.value!._id,
        subcategory_id: subCatId,
        sub_category_id: subCatId,
        type_category_id: selectedTypeCategory.value?._id,
        sell_method: sellMethod.value,
        price: Number(price.value),
        stock: isService ? 1 : (Number(stock.value) || 1),
        weight: isNeeded ? 100 : (isService ? 100 : Math.round((Number(weight.value) || 0.1) * 1000)),
        length: !isNeeded && !isService && length.value ? Number(length.value) : undefined,
        width: !isNeeded && !isService && width.value ? Number(width.value) : undefined,
        height: !isNeeded && !isService && height.value ? Number(height.value) : undefined,
        direct_meet: isNeeded || isService ? true : directMeet.value,
        delivery_courrier: isNeeded || isService ? false : deliveryCourrier.value,
        free_delivery: !isNeeded && !isService && freeDelivery.value ? (Number(totalFreeDelivery.value) || 0) : 0,
        total_free_delivery: !isNeeded && !isService && freeDelivery.value ? Number(totalFreeDelivery.value) || 0 : 0,
        address_data: address.value,
        image_data: images.value.map(img => img.base64),
        video: video.value || undefined,
        extra: !isNeeded && !isService ? dynamicAnswers.value : undefined,
        negotiation: false,
        step: 0,
        lang: 'id',
      }

      const res = await api.post<{ message: string; result?: { id?: string; _id?: string } }>(
        API_POST_SELL_SUBMIT,
        payload,
      )

      const createdId = res?.result?.id || res?.result?._id || productId.value || ''

      if (!isEditMode.value && import.meta.client) {
        localStorage.removeItem(DRAFT_STORAGE_KEY)
      }

      showNotification({
        type: 'success',
        message: isEditMode.value ? 'Perubahan iklan berhasil disimpan!' : 'Iklan berhasil ditayangkan!',
      })

      return createdId || 'success'
    } catch (err: any) {
      const msg = err?.data?.message || (err instanceof Error ? err.message : 'Gagal mempublikasikan iklan. Silakan periksa kembali formulir Anda.')
      showNotification({
        type: 'error',
        message: msg,
      })
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  // Apply AI Auto Post Data
  async function applyAiAutoPost(autoPost: AiPostAnalysisResult & { image?: string[]; images?: string[] }) {
    if (!autoPost) return
    title.value = autoPost.title || ''
    description.value = autoPost.description || ''
    price.value = Number(autoPost.price) || 0
    stock.value = Number(autoPost.stock) || 1
    weight.value = autoPost.weight ? Number((autoPost.weight / 1000).toFixed(2)) : 0.1
    length.value = autoPost.length ? Number(autoPost.length) : 20
    width.value = autoPost.width ? Number(autoPost.width) : 15
    height.value = autoPost.height ? Number(autoPost.height) : 10
    directMeet.value = autoPost.direct_meet ?? true
    deliveryCourrier.value = autoPost.via_courrier ?? true
    freeDelivery.value = Boolean(autoPost.free_delivery && autoPost.free_delivery > 0)
    totalFreeDelivery.value = autoPost.free_delivery ? Number(autoPost.free_delivery) : 0

    // Images
    const rawImgs = autoPost.images || autoPost.image || []
    if (Array.isArray(rawImgs) && rawImgs.length > 0) {
      images.value = rawImgs.map((b64, idx) => ({
        id: `ai_${Date.now()}_${idx}`,
        url: b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}`,
        base64: b64.replace(/^data:image\/\w+;base64,/, ''),
      }))
    }

    // Set Category & Subcategory
    if (autoPost.category_id) {
      const foundCat = categories.value.find(c => String(c._id) === String(autoPost.category_id))
      if (foundCat) selectedCategory.value = foundCat
      await fetchSubcategories(autoPost.category_id)
    }
    if (autoPost.subcategory_id) {
      const foundSub = subcategories.value.find(s => String(s._id) === String(autoPost.subcategory_id))
      if (foundSub) {
        selectedSubcategory.value = foundSub
        categoryCharge.value = foundSub.charge || 3
      }
      await initSubcategoryForm(autoPost.subcategory_id)
    }
    if (autoPost.type_id && typeCategories.value.length > 0) {
      const foundType = typeCategories.value.find(t => String(t._id) === String(autoPost.type_id))
      if (foundType) selectedTypeCategory.value = foundType
    }
  }

  // Setup auto-save watchers & error auto-clear watchers
  watch([title, description, price, stock, weight], () => {
    saveDraft()
  })

  watch(
    dynamicAnswers,
    () => {
      if (dynamicForms.value && dynamicForms.value.length > 0) {
        for (const field of dynamicForms.value) {
          const ans = dynamicAnswers.value.find((a) => String(a.id) === String(field.id))
          const isAnswered =
            String(field.type) === '1'
              ? Boolean(
                  ans &&
                  ans.answer_id !== undefined &&
                  ans.answer_id !== null &&
                  String(ans.answer_id).trim() !== '' &&
                  ans.answer &&
                  ans.answer.trim().length > 0
                )
              : Boolean(ans && ans.answer && ans.answer.trim().length > 0)

          if (isAnswered && errors.value['dynamic_' + field.id]) {
            delete errors.value['dynamic_' + field.id]
          }
        }
        const remaining = Object.keys(errors.value).filter((k) => k.startsWith('dynamic_'))
        if (remaining.length === 0 && errors.value.specs) {
          delete errors.value.specs
        }
      }
    },
    { deep: true },
  )

  watch(title, (v) => {
    if (v.trim().length >= 5 && errors.value.title) delete errors.value.title
  })
  watch(price, (v) => {
    if (v > 0 && errors.value.price) delete errors.value.price
  })
  watch(description, (v) => {
    if (v.trim().length >= 10 && errors.value.description) delete errors.value.description
  })
  watch(
    images,
    (v) => {
      if (v.length > 0 && errors.value.images) delete errors.value.images
    },
    { deep: true },
  )
  watch(address, (v) => {
    if (v && errors.value.address) delete errors.value.address
  })
  watch(selectedSubcategory, (v) => {
    if (v) {
      delete errors.value.subcategory
      delete errors.value.category
    }
  })

  onMounted(async () => {
    await fetchCategories()
    if (productId.value) {
      await loadExistingProduct(productId.value)
    } else {
      let restoredFromAi = false
      if (import.meta.client) {
        try {
          const aiRaw = sessionStorage.getItem('bekasku_ai_autopost') || localStorage.getItem('bekasku_ai_autopost')
          if (aiRaw) {
            sessionStorage.removeItem('bekasku_ai_autopost')
            localStorage.removeItem('bekasku_ai_autopost')
            const parsed = JSON.parse(aiRaw)
            await applyAiAutoPost(parsed)
            restoredFromAi = true
            showNotification({
              type: 'success',
              message: 'Data produk berhasil diisi otomatis oleh AI. Silakan periksa kembali sebelum menayangkan.',
            })
          }
        } catch {
          // ignore
        }
      }
      if (!restoredFromAi) {
        restoreDraft()
      }
      // Default to user address if available
      if (!address.value) {
        await addressComposable.fetchAddresses()
        if (addressComposable.currentAddress.value) {
          const a = addressComposable.currentAddress.value
          address.value = {
            id: a._id || a.id,
            _id: a._id || a.id,
            address_name: a.address_name || 'Rumah',
            address: a.address || '',
            city: a.city || '',
            province: a.province || '',
            postal: a.postal || a.postal_code || '',
            subdistrict: a.subdistrict || '',
            subdistrict_id: String(a.subdistrict_id || ''),
            city_id: String(a.city_id || ''),
            lon: Number(a.lon ?? a.lng ?? a.location?.coordinates?.[0] ?? 0),
            lat: Number(a.lat ?? a.location?.coordinates?.[1] ?? 0),
            contact_name: a.contact_name || authStore.user?.name || '',
            contact_phone: a.contact_phone || authStore.user?.phone || '',
          }
        }
      }
    }
  })

  return {
    loading,
    isSubmitting,
    isAiPriceLoading,
    aiPriceResult,
    categories,
    subcategories,
    typeCategories,
    isCategoriesLoading,
    isSubcategoriesLoading,
    productId,
    sellMethod,
    isEditMode,
    maxPhotos,
    selectedCategory,
    selectedSubcategory,
    selectedTypeCategory,
    categoryCharge,
    serviceFeePercent,
    estimatedServiceFee,
    estimatedNetEarnings,
    title,
    description,
    price,
    stock,
    weight,
    length,
    width,
    height,
    directMeet,
    deliveryCourrier,
    freeDelivery,
    totalFreeDelivery,
    address,
    images,
    video,
    isImageProcessing,
    imageProcessProgress,
    dynamicForms,
    dynamicAnswers,
    errors,
    fetchCategories,
    fetchSubcategories,
    selectCategory,
    selectSubcategory,
    askAiPrice,
    applyAiPrice,
    addImageFiles,
    removeImage,
    setCoverImage,
    saveDraft,
    clearDraft,
    applyAiAutoPost,
    submitProduct,
    isFormValid,
    validateForm,
    scrollToFirstError,
    isFieldRequired,
  }
}
