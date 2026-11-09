<template>
  <AppModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="p-6 text-center max-w-sm mx-auto">
      <!-- Icon Indicator -->
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 text-primary flex items-center justify-center border border-red-100 shadow-xs">
        <Radio class="w-8 h-8 animate-pulse" />
      </div>

      <h3 class="text-lg font-bold text-gray-900 font-outfit mb-2">
        Siaran Live Tersedia di Aplikasi
      </h3>

      <p class="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
        Untuk memulai siaran langsung (Live Streaming) sebagai penjual dengan kamera dan audio optimal, silakan gunakan aplikasi mobile <span class="font-bold text-gray-900">BekasKu</span>.
      </p>

      <!-- Store Download Buttons -->
      <div class="space-y-2.5">
        <a
          :href="PLAY_STORE_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
        >
          <Smartphone class="w-4 h-4 text-emerald-400" />
          <span>Download di Google Play</span>
        </a>

        <a
          :href="APP_STORE_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold text-xs sm:text-sm transition-all active:scale-95 border border-gray-200"
        >
          <Download class="w-4 h-4 text-gray-700" />
          <span>Download di App Store</span>
        </a>
      </div>

      <button
        type="button"
        class="mt-4 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
        @click="$emit('update:modelValue', false)"
      >
        Tutup
      </button>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { Radio, Smartphone, Download } from 'lucide-vue-next'
import AppModal from '~/components/shared/AppModal.vue'
import { PLAY_STORE_URL, APP_STORE_URL } from '~/utils/constants'

defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

