<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'
import PaymentDetailView from '~/components/payment/PaymentDetailView.vue'

const props = defineProps<{
  modelValue: boolean
  paymentId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  pay: []
  paid: []
  cancelled: []
}>()

const isMounted = ref(import.meta.client)

onMounted(() => {
  isMounted.value = true
})

watch(
  () => props.modelValue,
  (isOpen) => {
    if (import.meta.client) {
      document.body.style.overflow = isOpen ? 'hidden' : ''
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

function closeModal() {
  emit('update:modelValue', false)
}

function handlePay() {
  emit('pay')
  emit('update:modelValue', false)
}

function handlePaid() {
  emit('paid')
  emit('update:modelValue', false)
}

function handleCancelled() {
  emit('cancelled')
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport v-if="isMounted" to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-outfit overscroll-contain"
        role="dialog"
        aria-modal="true"
        @click.self="closeModal"
      >
        <div
          class="w-full max-w-lg max-h-[90vh] bg-white rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-scale-in"
        >
          <!-- Sticky Modal Header -->
          <div class="sticky top-0 z-10 bg-white border-b border-border px-4 py-3 flex items-center justify-between shadow-2xs shrink-0">
            <h2 class="font-outfit font-bold text-base text-text">
              Detail Pesanan
            </h2>
            <button
              type="button"
              class="p-1.5 rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Tutup detail pesanan"
              @click="closeModal"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Shared Verified PaymentDetailView -->
          <PaymentDetailView
            v-if="paymentId"
            :key="`modal_payment_detail_${paymentId}`"
            :payment-id="paymentId"
            @pay="handlePay"
            @paid="handlePaid"
            @cancelled="handleCancelled"
            @close="closeModal"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scale-in {
  animation: scaleIn 0.15s ease-out forwards;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
