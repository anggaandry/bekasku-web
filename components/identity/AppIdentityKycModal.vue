<script setup lang="ts">
import { X, ChevronLeft } from 'lucide-vue-next'
import { useIdentityKycModal } from '~/composables/useIdentityKyc'
import KycStepIntro from '~/components/identity/KycStepIntro.vue'
import KycStepChoose from '~/components/identity/KycStepChoose.vue'
import KycStepGuide from '~/components/identity/KycStepGuide.vue'
import KycStepCapture from '~/components/identity/KycStepCapture.vue'
import KycStepReview from '~/components/identity/KycStepReview.vue'
import KycStepSuccess from '~/components/identity/KycStepSuccess.vue'
import type { KycModalStep } from '~/types/identity'

const kycModal = useIdentityKycModal()

const isDark = computed(() => kycModal.step.value === 'capture')
const title = computed(() =>
  kycModal.step.value === 'capture' ? 'Foto Kartu Identitas' : 'Verifikasi Identitas',
)
const showBack = computed(
  () => kycModal.step.value !== 'intro' && kycModal.step.value !== 'success',
)

const previousStep: Partial<Record<KycModalStep, KycModalStep>> = {
  choose: 'intro',
  guide: 'choose',
  capture: 'guide',
  review: 'capture',
}

function handleBack() {
  const prev = previousStep[kycModal.step.value]
  if (prev) {
    kycModal.setStep(prev)
  } else {
    kycModal.close()
  }
}

function handleCaptureError(message: string) {
  kycModal.errorMessage.value = message
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && kycModal.isOpen.value && !kycModal.isSubmitting.value) {
    kycModal.close()
  }
}

watch(
  () => kycModal.isOpen.value,
  (open) => {
    if (!import.meta.client) return
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      window.addEventListener('keydown', handleKeydown)
    } else {
      window.removeEventListener('keydown', handleKeydown)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="kycModal.isOpen.value"
        class="fixed inset-0 z-[85] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
        @click.self="kycModal.close"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="kyc-modal-title"
          class="w-full sm:max-w-md md:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[94vh] flex flex-col overflow-hidden"
          :class="isDark ? 'bg-text text-white' : 'bg-white text-text'"
        >
          <div v-if="!isDark" class="flex justify-center pt-3 pb-1 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-border" />
          </div>

          <div
            class="px-5 py-3.5 flex items-center justify-between shrink-0 border-b"
            :class="isDark ? 'border-white/10' : 'border-border'"
          >
            <div class="flex items-center gap-2.5">
              <button
                v-if="showBack"
                type="button"
                class="p-1 -ml-1 rounded-full transition-colors cursor-pointer"
                :class="isDark ? 'hover:bg-white/15 text-white' : 'hover:bg-surface-2 text-text'"
                aria-label="Kembali"
                @click="handleBack"
              >
                <ChevronLeft class="w-5 h-5" aria-hidden="true" />
              </button>
              <h2 id="kyc-modal-title" class="font-bold text-sm sm:text-base tracking-tight">
                {{ title }}
              </h2>
            </div>

            <button
              type="button"
              class="p-1.5 rounded-full transition-colors cursor-pointer"
              :class="isDark ? 'hover:bg-white/15 text-white/80' : 'hover:bg-surface-2 text-text-muted hover:text-text'"
              aria-label="Tutup"
              @click="kycModal.close"
            >
              <X class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto overscroll-contain">
            <KycStepIntro
              v-if="kycModal.step.value === 'intro'"
              :reason="kycModal.featureReason.value"
              @start="kycModal.setStep('choose')"
              @skip="kycModal.close"
            />

            <KycStepChoose
              v-else-if="kycModal.step.value === 'choose'"
              @select="kycModal.setDocType"
            />

            <KycStepGuide
              v-else-if="kycModal.step.value === 'guide'"
              :doc-type="kycModal.docType.value"
              @ready="kycModal.setStep('capture')"
            />

            <KycStepCapture
              v-else-if="kycModal.step.value === 'capture'"
              :is-ocr-loading="kycModal.isOcrLoading.value"
              :error-message="kycModal.errorMessage.value"
              @captured="kycModal.processCapturedImage"
              @error="handleCaptureError"
            />

            <KycStepReview
              v-else-if="kycModal.step.value === 'review'"
              v-model:name="kycModal.identityName.value"
              v-model:number="kycModal.identityNumber.value"
              :doc-type="kycModal.docType.value"
              :captured-image="kycModal.capturedImage.value"
              :error-message="kycModal.errorMessage.value"
              :is-submitting="kycModal.isSubmitting.value"
              @retake="kycModal.setStep('capture')"
              @submit="kycModal.submitKyc"
            />

            <KycStepSuccess
              v-else-if="kycModal.step.value === 'success'"
              @done="kycModal.close"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
