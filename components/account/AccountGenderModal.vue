<template>
  <AppModal
    :model-value="modelValue"
    max-width="max-w-md"
    :show-close-button="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="space-y-5 font-outfit select-none">
      <!-- Drag handle bar (matching Gambar 3) -->
      <div class="flex justify-center -mt-1">
        <div class="w-10 h-1 bg-border rounded-full"></div>
      </div>

      <!-- Header with title & close icon -->
      <div class="flex items-center justify-between pb-2 border-b border-border/80">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text cursor-pointer transition-colors"
            aria-label="Tutup"
            @click="$emit('update:modelValue', false)"
          >
            <X class="w-5 h-5 text-text-muted" />
          </button>
          <h3 class="font-bold text-base sm:text-lg text-text">
            Jenis Kelamin
          </h3>
        </div>
      </div>

      <!-- Gender Radio Options (matching Gambar 3) -->
      <div class="space-y-3 pt-1">
        <!-- Option: Laki-laki -->
        <label
          class="flex items-center gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer"
          :class="selectedGender === 'L' ? 'border-primary/50 bg-primary/5 shadow-2xs' : 'border-border hover:bg-surface-2'"
        >
          <!-- Custom Red Radio Button -->
          <div
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0"
            :class="selectedGender === 'L' ? 'border-primary' : 'border-text-subtle'"
          >
            <div
              v-if="selectedGender === 'L'"
              class="w-2.5 h-2.5 rounded-full bg-primary"
            ></div>
          </div>
          <input
            v-model="selectedGender"
            type="radio"
            name="gender-choice"
            value="L"
            class="sr-only"
          />
          <span class="text-sm font-semibold text-text">Laki-laki</span>
        </label>

        <!-- Option: Perempuan -->
        <label
          class="flex items-center gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer"
          :class="selectedGender === 'P' ? 'border-primary/50 bg-primary/5 shadow-2xs' : 'border-border hover:bg-surface-2'"
        >
          <!-- Custom Red Radio Button -->
          <div
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0"
            :class="selectedGender === 'P' ? 'border-primary' : 'border-text-subtle'"
          >
            <div
              v-if="selectedGender === 'P'"
              class="w-2.5 h-2.5 rounded-full bg-primary"
            ></div>
          </div>
          <input
            v-model="selectedGender"
            type="radio"
            name="gender-choice"
            value="P"
            class="sr-only"
          />
          <span class="text-sm font-semibold text-text">Perempuan</span>
        </label>
      </div>

      <!-- Submit Button (matching Gambar 3) -->
      <div class="pt-2">
        <button
          type="button"
          :disabled="!selectedGender || isSubmitting"
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
import { ref, watch } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'
import AppModal from '~/components/shared/AppModal.vue'

const props = defineProps<{
  modelValue: boolean
  initialGender?: string
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', gender: string): void
}>()

const selectedGender = ref('L')

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      selectedGender.value = props.initialGender === 'P' ? 'P' : 'L'
    }
  },
  { immediate: true }
)

function handleSave() {
  if (props.isSubmitting) return
  emit('save', selectedGender.value)
}
</script>

