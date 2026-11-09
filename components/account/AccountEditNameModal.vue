<template>
  <AppModal
    :model-value="modelValue"
    max-width="max-w-md"
    :show-close-button="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="space-y-5 font-outfit select-none">
      <!-- Header with back button -->
      <div class="flex items-center gap-3 pb-3 border-b border-border/80">
        <button
          type="button"
          class="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text cursor-pointer transition-colors"
          aria-label="Kembali"
          @click="$emit('update:modelValue', false)"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h3 class="font-bold text-base sm:text-lg text-text">
          Ubah Nama
        </h3>
      </div>

      <!-- Description Subtitle -->
      <p class="text-xs sm:text-[13px] text-text-muted leading-relaxed">
        Pastikan pakai nama asli untuk memudahkan proses verifikasi. Nama ini akan muncul di beberapa halaman.
      </p>

      <!-- Input Field Section -->
      <div class="space-y-2">
        <label class="block text-xs font-bold text-text">
          Nama
        </label>
        <div class="relative">
          <input
            id="account-name-input"
            ref="inputRef"
            v-model="nameValue"
            name="account_name"
            aria-label="Nama Lengkap"
            type="text"
            maxlength="50"
            placeholder="Masukkan nama lengkap"
            class="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-hidden text-xs sm:text-sm bg-white text-text font-medium transition-colors pr-10"
            @keyup.enter="handleSave"
          />
          <button
            v-if="nameValue.length > 0"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface-3 hover:bg-surface-4 flex items-center justify-center text-text-muted transition-colors cursor-pointer"
            aria-label="Hapus teks"
            @click="nameValue = ''; inputRef?.focus()"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="pt-2">
        <button
          type="button"
          :disabled="!nameValue.trim() || isSubmitting"
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs active:scale-[0.99]"
          @click="handleSave"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}</span>
        </button>
      </div>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ArrowLeft, X, Loader2 } from 'lucide-vue-next'
import AppModal from '~/components/shared/AppModal.vue'

const props = defineProps<{
  modelValue: boolean
  initialName?: string
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', name: string): void
}>()

const nameValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      nameValue.value = props.initialName || ''
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  },
  { immediate: true }
)

function handleSave() {
  const trimmed = nameValue.value.trim()
  if (!trimmed || props.isSubmitting) return
  emit('save', trimmed)
}
</script>
