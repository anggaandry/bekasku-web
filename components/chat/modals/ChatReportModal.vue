<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { CHAT_BLOCK_REASONS } from '~/utils/constants'

const props = defineProps<{
  modelValue: boolean
  userName?: string
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'submit', reason: string): void
}>()

const selectedIndex = ref<number | null>(null)
const customReason = ref('')

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      selectedIndex.value = null
      customReason.value = ''
    }
  },
)

const isOtherSelected = () => selectedIndex.value === CHAT_BLOCK_REASONS.length - 1

const canSubmit = () => {
  if (selectedIndex.value === null) return false
  if (isOtherSelected()) return customReason.value.trim().length > 0
  return true
}

function handleConfirm() {
  if (!canSubmit()) return
  const reason = isOtherSelected()
    ? customReason.value.replace(/[<>]/g, '').trim()
    : CHAT_BLOCK_REASONS[selectedIndex.value!] || 'Lainnya'
  emit('submit', reason)
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
      @click="close"
    >
      <div
        class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl"
        @click.stop
      >
        <!-- Header (matches report_reason_modal.dart) -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="close"
            class="p-1.5 -ml-1.5 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X class="w-5 h-5" />
          </button>
          <h3 class="font-outfit font-bold text-lg text-text">
            Pilih Alasan Blokir
          </h3>
        </div>

        <p v-if="userName" class="font-outfit text-xs text-text-muted">
          Anda akan memblokir interaksi pesan dengan <strong class="text-text">{{ userName }}</strong>.
        </p>

        <!-- Radio List -->
        <div class="divide-y divide-border-light">
          <label
            v-for="(item, idx) in CHAT_BLOCK_REASONS"
            :key="item"
            class="py-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
            @click="selectedIndex = idx"
          >
            <span class="font-outfit text-sm text-text">{{ item }}</span>
            <span
              class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0"
              :class="selectedIndex === idx ? 'border-primary' : 'border-border'"
            >
              <span
                v-if="selectedIndex === idx"
                class="w-2.5 h-2.5 rounded-full bg-primary"
              ></span>
            </span>
          </label>
        </div>

        <!-- Custom Reason Textarea when 'Lainnya' selected -->
        <div v-if="isOtherSelected()" class="pt-1">
          <textarea
            v-model="customReason"
            rows="3"
            placeholder="Tulis alasan blokir..."
            class="w-full rounded-xl border border-border-light focus:border-primary p-3 font-outfit text-sm text-text outline-hidden resize-none"
          />
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <button
            type="button"
            :disabled="!canSubmit() || isSubmitting"
            @click="handleConfirm"
            class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-muted disabled:text-text-subtle text-white font-outfit font-bold text-sm flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span
              v-if="isSubmitting"
              class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            <span v-else class="text-white">Blokir Pengguna</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

