const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const JPEG_QUALITY = 0.85

export type KycCameraFacing = 'environment' | 'user'

export function useKycCamera(onCaptured: (base64: string) => void, onError: (message: string) => void) {
  const videoRef = ref<HTMLVideoElement | null>(null)
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const fileInputRef = ref<HTMLInputElement | null>(null)
  const mediaStream = ref<MediaStream | null>(null)
  const facing = ref<KycCameraFacing>('environment')
  const isActive = ref(false)
  const cameraError = ref('')

  function stop() {
    mediaStream.value?.getTracks().forEach((track) => track.stop())
    mediaStream.value = null
    isActive.value = false
    cameraError.value = ''
  }

  function resolveErrorMessage(name?: string): string {
    if (name === 'NotAllowedError') {
      return 'Izin akses kamera tidak diberikan. Silakan aktifkan izin kamera atau unggah berkas foto kartu identitas Anda.'
    }
    if (name === 'NotFoundError') {
      return 'Kamera tidak terdeteksi pada perangkat Anda. Silakan unggah foto kartu identitas.'
    }
    return 'Tidak dapat membuka kamera. Silakan pilih berkas foto dari penyimpanan Anda.'
  }

  async function start() {
    if (!import.meta.client) return
    stop()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing.value,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      mediaStream.value = stream

      if (videoRef.value) {
        videoRef.value.srcObject = stream
        await videoRef.value.play()
        isActive.value = true
      }
    } catch (err: unknown) {
      isActive.value = false
      cameraError.value = resolveErrorMessage((err as { name?: string }).name)
    }
  }

  async function toggleFacing() {
    facing.value = facing.value === 'environment' ? 'user' : 'environment'
    await start()
  }

  function capture() {
    const video = videoRef.value
    if (!video || !isActive.value) return

    const canvas = canvasRef.value || document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
    stop()
    onCaptured(base64)
  }

  function openFilePicker() {
    fileInputRef.value?.click()
  }

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    if (file.size > MAX_UPLOAD_BYTES) {
      onError('Ukuran berkas maksimal 10 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      if (base64) {
        stop()
        onCaptured(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  onBeforeUnmount(stop)

  return {
    videoRef,
    canvasRef,
    fileInputRef,
    isActive,
    cameraError,
    start,
    stop,
    toggleFacing,
    capture,
    openFilePicker,
    handleFileChange,
  }
}

