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
          Ubah Bio
        </h3>
      </div>

      <!-- Description Subtitle -->
      <p class="text-xs sm:text-[13px] text-text-muted leading-relaxed">
        Bio akan tampil di halaman profil kamu. Bagikan hal menarik agar pengguna lain lebih mengenalmu.
      </p>

      <!-- Textarea Section -->
      <div class="space-y-2">
        <label class="block text-xs font-bold text-text">
          Bio
        </label>
        <textarea
          id="account-bio-textarea"
          ref="textareaRef"
          v-model="bioValue"
          name="account_bio"
          aria-label="Bio Profil"
          rows="4"
          maxlength="150"
          placeholder="Tulis bio tentangmu..."
          class="w-full p-3.5 rounded-xl border border-border focus:border-primary focus:outline-hidden text-xs sm:text-sm bg-white text-text font-medium transition-colors resize-none leading-relaxed"
        ></textarea>
        <div class="text-right text-[11px] text-text-muted">
          {{ bioValue.length }}/150
        </div>
      </div>

      <!-- Submit Button -->
      <div class="pt-2">
        <button
          type="button"
          :disabled="isSubmitting"
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
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import AppModal from '~/components/shared/AppModal.vue'

const props = defineProps<{
  modelValue: boolean
  initialBio?: string
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', bio: string): void
}>()

const bioValue = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      bioValue.value = props.initialBio || ''
      nextTick(() => {
        textareaRef.value?.focus()
      })
    }
  },
  { immediate: true }
)

function handleSave() {
  if (props.isSubmitting) return
  emit('save', bioValue.value.trim())
}
</script>
