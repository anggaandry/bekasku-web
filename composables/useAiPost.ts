import { ref } from 'vue'
import { API_ASK_POST_AI } from '~/utils/constants'
import type { UploadedImage, AiPostAnalysisResult } from '~/types/post'
import { useNotification } from '~/composables/useNotification'

export function useAiPost() {
  const api = useApi()
  const { showNotification } = useNotification()

  const images = ref<UploadedImage[]>([])
  const message = ref('')
  const isLoading = ref(false)
  const isAnalyzing = ref(false)
  const aiResult = ref<AiPostAnalysisResult | null>(null)
  const showVipModal = ref(false)
  const vipModalMessage = ref('')
  const maxPhotos = 10

  async function addImageFiles(files: FileList | File[]) {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    const remainingSlots = maxPhotos - images.value.length
    if (remainingSlots <= 0) {
      showNotification({
        type: 'error',
        message: `Batas maksimal foto adalah ${maxPhotos} foto.`,
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

    for (const file of filesToProcess) {
      const isImage =
        file.type.startsWith('image/') ||
        /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(file.name)
      if (!isImage) {
        showNotification({
          type: 'warning',
          message: `File "${file.name}" bukan format gambar yang valid.`,
        })
        continue
      }

      try {
        const compressed = await compressImageFile(file)
        images.value.push({
          id: `ai_img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          url: compressed.dataUrl,
          base64: compressed.base64,
        })
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Format tidak didukung'
        showNotification({
          type: 'error',
          message: `Gagal memproses gambar "${file.name}": ${errMsg}`,
        })
      }
    }
  }

  function removeImage(index: number) {
    images.value.splice(index, 1)
  }

  async function compressImageFile(
    file: File,
  ): Promise<{ dataUrl: string; base64: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Gagal membaca file gambar'))
      reader.onload = () => {
        const resultStr = String(reader.result || '')
        const img = new Image()
        img.onerror = () => reject(new Error('Format gambar tidak didukung'))
        img.onload = () => {
          // Align with mobile v3 AiPostController: max 1024x1024, quality 0.85
          const maxDim = 1024
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
            const rawBase64 = resultStr.includes(',')
              ? (resultStr.split(',')[1] ?? '')
              : resultStr
            resolve({ dataUrl: resultStr, base64: rawBase64 })
            return
          }

          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)

          const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
          const base64 = dataUrl.split(',')[1] ?? ''
          resolve({ dataUrl, base64 })
        }
        img.src = resultStr
      }
      reader.readAsDataURL(file)
    })
  }

  async function askAi(): Promise<boolean> {
    if (images.value.length === 0) {
      showNotification({
        type: 'warning',
        message: 'Tambahkan minimal 1 foto barang.',
      })
      return false
    }

    isLoading.value = true
    isAnalyzing.value = true

    try {
      const payload = {
        lang: 'id',
        images: images.value.map((img) => img.base64),
        description: message.value.trim(),
      }

      const res = await api.post<{
        message?: string
        status?: number | boolean
        result?: AiPostAnalysisResult
      }>(API_ASK_POST_AI, payload)

      const isSuccess =
        res?.status === 1 ||
        res?.status === true ||
        res?.message?.toString().toLowerCase() === 'success' ||
        Boolean(res?.result?.title)

      if (isSuccess && res?.result) {
        aiResult.value = res.result
        return true
      }

      const errMsg = res?.message || 'Gagal menganalisis produk dengan AI'
      const errLower = errMsg.toLowerCase()
      if (
        errLower.includes('batas') ||
        errLower.includes('vip') ||
        errLower.includes('kuota')
      ) {
        vipModalMessage.value = errMsg
        showVipModal.value = true
      } else {
        showNotification({
          type: 'error',
          message: errMsg,
        })
      }
      return false
    } catch (err: unknown) {
      const errObj = err as {
        message?: string
        status?: number
        data?: { message?: string }
      }
      const errMsg =
        errObj?.data?.message ||
        errObj?.message ||
        'Terjadi kesalahan koneksi saat memproses AI.'
      const errLower = errMsg.toLowerCase()

      if (
        errObj?.status === 429 ||
        errLower.includes('batas') ||
        errLower.includes('vip') ||
        errLower.includes('kuota')
      ) {
        vipModalMessage.value = errMsg
        showVipModal.value = true
      } else if (errLower.includes('timeout')) {
        showNotification({
          type: 'error',
          message: 'Koneksi timeout saat memproses AI. Silakan coba lagi.',
        })
      } else {
        showNotification({
          type: 'error',
          message: errMsg,
        })
      }
      return false
    } finally {
      isLoading.value = false
      isAnalyzing.value = false
    }
  }

  function buildAutoPostPayload():
    | (AiPostAnalysisResult & { images: string[]; stock: number })
    | null {
    if (!aiResult.value) return null

    const data = {
      ...aiResult.value,
      images: images.value.map((img) => img.base64),
      stock: 1,
    }

    if (import.meta.client) {
      try {
        const serialized = JSON.stringify(data)
        sessionStorage.setItem('bekasku_ai_autopost', serialized)
        localStorage.setItem('bekasku_ai_autopost', serialized)
      } catch {
        // ignore storage quota errors
      }
    }

    return data
  }

  function continueToPost() {
    const data = buildAutoPostPayload()
    if (!data) return
    navigateTo('/post/sell')
  }

  function resetToInput() {
    aiResult.value = null
  }

  return {
    images,
    message,
    isLoading,
    isAnalyzing,
    aiResult,
    showVipModal,
    vipModalMessage,
    maxPhotos,
    addImageFiles,
    removeImage,
    askAi,
    buildAutoPostPayload,
    continueToPost,
    resetToInput,
  }
}
