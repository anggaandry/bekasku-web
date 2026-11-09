import { ref, onBeforeUnmount } from 'vue'

export interface PreparedImage {
  base64: string
  dataUrl: string
  name: string
}

export interface PreparedVideo {
  file: File
  objectUrl: string
  name: string
}

export function useChatMedia() {
  const isCameraActive = ref(false)
  const cameraError = ref('')
  const isRecordingVideo = ref(false)
  const recordingSeconds = ref(0)
  const facingMode = ref<'user' | 'environment'>('environment')

  let mediaStream: MediaStream | null = null
  let mediaRecorder: MediaRecorder | null = null
  let recordedChunks: Blob[] = []
  let recordTimer: ReturnType<typeof setInterval> | null = null

  /**
   * Compress and convert an image File/Blob to pure Base64 (without data:image/...;base64, prefix)
   * matching mobile ImagePicker(imageQuality: 50) + base64Encode(bytes).
   */
  async function fileToPreparedImage(file: File | Blob, fileName = 'photo.jpg'): Promise<PreparedImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Gagal membaca file gambar'))
      reader.onload = () => {
        const resultStr = String(reader.result || '')
        const img = new Image()
        img.onerror = () => reject(new Error('Format gambar tidak didukung'))
        img.onload = () => {
          const maxDim = 1280
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
            resolve({
              base64: rawBase64,
              dataUrl: resultStr,
              name: fileName,
            })
            return
          }
          ctx.drawImage(img, 0, 0, width, height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.72)
          const base64 = dataUrl.split(',')[1] || ''
          resolve({
            base64,
            dataUrl,
            name: fileName,
          })
        }
        img.src = resultStr
      }
      reader.readAsDataURL(file)
    })
  }

  function fileToPreparedVideo(file: File): PreparedVideo {
    const objectUrl = URL.createObjectURL(file)
    return {
      file,
      objectUrl,
      name: file.name || `video-${Date.now()}.mp4`,
    }
  }

  async function startCamera(
    videoEl: HTMLVideoElement | null,
    options: { withAudio?: boolean; mode?: 'user' | 'environment' } = {},
  ): Promise<boolean> {
    stopCamera()
    cameraError.value = ''
    if (!import.meta.client || !navigator.mediaDevices?.getUserMedia) {
      cameraError.value = 'Browser ini tidak mendukung akses kamera langsung. Silakan pilih file dari perangkat.'
      return false
    }

    const targetMode = options.mode || facingMode.value
    facingMode.value = targetMode

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: Boolean(options.withAudio),
      })
      if (videoEl) {
        videoEl.srcObject = mediaStream
        await videoEl.play().catch(() => {})
      }
      isCameraActive.value = true
      return true
    } catch {
      cameraError.value = 'Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan atau unggah dari galeri.'
      isCameraActive.value = false
      return false
    }
  }

  function capturePhotoFromVideo(videoEl: HTMLVideoElement | null): PreparedImage | null {
    if (!videoEl || !isCameraActive.value) return null
    const width = videoEl.videoWidth || 1280
    const height = videoEl.videoHeight || 720
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(videoEl, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.78)
    const base64 = dataUrl.split(',')[1] || ''
    stopCamera()
    return {
      base64,
      dataUrl,
      name: `live-photo-${Date.now()}.jpg`,
    }
  }

  function startVideoRecording(): boolean {
    if (!mediaStream || typeof MediaRecorder === 'undefined') {
      cameraError.value = 'Perekaman video tidak didukung pada browser ini.'
      return false
    }
    recordedChunks = []
    recordingSeconds.value = 0

    const mimeTypes = [
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ]
    const supportedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || ''

    try {
      mediaRecorder = supportedMime
        ? new MediaRecorder(mediaStream, { mimeType: supportedMime })
        : new MediaRecorder(mediaStream)

      mediaRecorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          recordedChunks.push(ev.data)
        }
      }

      mediaRecorder.start(250)
      isRecordingVideo.value = true

      if (recordTimer) clearInterval(recordTimer)
      recordTimer = setInterval(() => {
        recordingSeconds.value += 1
      }, 1000)
      return true
    } catch {
      cameraError.value = 'Gagal memulai perekaman video.'
      return false
    }
  }

  function stopVideoRecording(): Promise<PreparedVideo | null> {
    return new Promise((resolve) => {
      if (recordTimer) {
        clearInterval(recordTimer)
        recordTimer = null
      }
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        isRecordingVideo.value = false
        stopCamera()
        resolve(null)
        return
      }

      mediaRecorder.onstop = () => {
        isRecordingVideo.value = false
        const mimeType = mediaRecorder?.mimeType || 'video/webm'
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
        const blob = new Blob(recordedChunks, { type: mimeType })
        const fileName = `live-video-${Date.now()}.${ext}`
        const file = new File([blob], fileName, { type: mimeType })
        const objectUrl = URL.createObjectURL(file)
        stopCamera()
        resolve({
          file,
          objectUrl,
          name: fileName,
        })
      }

      mediaRecorder.stop()
    })
  }

  function stopCamera() {
    if (recordTimer) {
      clearInterval(recordTimer)
      recordTimer = null
    }
    isRecordingVideo.value = false
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      mediaStream = null
    }
    isCameraActive.value = false
  }

  onBeforeUnmount(() => {
    stopCamera()
  })

  return {
    isCameraActive,
    cameraError,
    isRecordingVideo,
    recordingSeconds,
    facingMode,
    fileToPreparedImage,
    fileToPreparedVideo,
    startCamera,
    capturePhotoFromVideo,
    startVideoRecording,
    stopVideoRecording,
    stopCamera,
  }
}

