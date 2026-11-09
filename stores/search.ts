import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', () => {
  const visualFile = ref<File | null>(null)
  const visualPreviewUrl = ref<string>('')
  const isVisualMode = ref<boolean>(false)
  const queryDurationMs = ref<number>(0)

  function setVisualFile(file: File | null) {
    if (visualPreviewUrl.value && import.meta.client) {
      try {
        URL.revokeObjectURL(visualPreviewUrl.value)
      } catch {
        // ignore
      }
    }
    visualFile.value = file
    if (file && import.meta.client) {
      visualPreviewUrl.value = URL.createObjectURL(file)
      isVisualMode.value = true
    } else {
      visualPreviewUrl.value = ''
      isVisualMode.value = false
    }
  }

  function clearVisualSearch() {
    setVisualFile(null)
    queryDurationMs.value = 0
  }

  return {
    visualFile,
    visualPreviewUrl,
    isVisualMode,
    queryDurationMs,
    setVisualFile,
    clearVisualSearch,
  }
})

