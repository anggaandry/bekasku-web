<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Check, X } from 'lucide-vue-next'
import { FAQ_SATISFIED_REASONS, FAQ_UNSATISFIED_REASONS } from '~/utils/constants'

const props = defineProps<{
  modelValue: boolean
  isSatisfied: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', reasons: string[]): void
}>()

const isMounted = ref(false)
const selectedReasons = ref<string[]>([])

const reasons = computed(() =>
  props.isSatisfied ? FAQ_SATISFIED_REASONS : FAQ_UNSATISFIED_REASONS,
)

onMounted(() => {
  isMounted.value = true
})

function handleWindowKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape' && props.modelValue) {
    close()
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      selectedReasons.value = []
      if (import.meta.client) {
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleWindowKeydown)
      }
    } else if (import.meta.client) {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleWindowKeydown)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleWindowKeydown)
    if (props.modelValue) {
      document.body.style.overflow = ''
    }
  }
})

function toggleReason(reason: string) {
  if (selectedReasons.value.includes(reason)) {
    selectedReasons.value = selectedReasons.value.filter(r => r !== reason)
  } else {
    selectedReasons.value = [...selectedReasons.value, reason]
  }
}

function close() {
  emit('update:modelValue', false)
}

function submit() {
  if (selectedReasons.value.length === 0) return
  emit('submit', selectedReasons.value)
}
</script>

<template>
  <Teleport v-if="isMounted" to="body">
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-[85] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="faq-feedback-modal-title"
      @click.self="close"
    >
      <div
        class="bg-white w-full sm:max-w-lg max-h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-modal"
      >
        <!-- Drag Handle (< sm) -->
        <div class="pt-3 pb-1 flex justify-center sm:hidden">
          <span class="w-10 h-1 rounded-full bg-border-light"></span>
        </div>

        <!-- Header -->
        <div class="px-5 sm:px-6 py-4 border-b border-border flex items-center gap-3">
          <button
            type="button"
            class="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Tutup modal feedback"
            @click="close"
          >
            <X class="w-5 h-5" />
          </button>
          <h2
            id="faq-feedback-modal-title"
            class="font-outfit font-bold text-base sm:text-lg text-text"
          >
            {{
              props.isSatisfied
                ? 'Feedback Kepuasan Artikel'
                : 'Feedback Ketidakpuasan Artikel'
            }}
          </h2>
        </div>

        <!-- Reason Checklist (mirrors faq_feedback_modal.dart) -->
        <div class="px-5 sm:px-6 py-2 overflow-y-auto divide-y divide-border/70">
          <button
            v-for="reason in reasons"
            :key="reason"
            type="button"
            role="checkbox"
            :aria-checked="selectedReasons.includes(reason)"
            class="w-full min-h-[52px] py-3.5 flex items-center justify-between gap-4 text-left hover:bg-surface-2/60 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            @click="toggleReason(reason)"
          >
            <span class="font-outfit font-medium text-sm text-text leading-snug">
              {{ reason }}
            </span>

            <span
              class="w-5 h-5 rounded-sm border flex items-center justify-center shrink-0 transition-colors"
              :class="
                selectedReasons.includes(reason)
                  ? 'bg-primary border-primary text-white'
                  : 'border-border-light bg-white'
              "
            >
              <Check
                v-if="selectedReasons.includes(reason)"
                class="w-3.5 h-3.5 stroke-[2.5]"
                aria-hidden="true"
              />
            </span>
          </button>
        </div>

        <!-- Submit Action -->
        <div class="p-5 sm:px-6 sm:pb-6 border-t border-border bg-white">
          <button
            type="button"
            :disabled="selectedReasons.length === 0"
            class="w-full min-h-[48px] py-3 rounded-xl font-outfit font-semibold text-sm transition-colors cursor-pointer disabled:bg-muted disabled:text-text-muted disabled:border disabled:border-border disabled:cursor-not-allowed bg-primary hover:bg-primary-dark text-white focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            @click="submit"
          >
            Kirim Feedback
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

