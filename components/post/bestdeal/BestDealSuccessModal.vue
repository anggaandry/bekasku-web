<script setup lang="ts">
defineProps<{
  modelValue: boolean
  scheduleDate?: string
  productId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'view-product'): void
}>()

function close() {
  emit('update:modelValue', false)
}

function handleViewProduct() {
  close()
  emit('view-product')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain transition-opacity font-outfit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bd-success-title"
    >
      <div
        class="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col p-6 sm:p-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
      >
        <!-- Illustration Success Mark BD -->
        <div class="mx-auto w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center animate-in zoom-in-75 duration-300">
          <img
            src="/images/post/success_markbd.png"
            alt="Best Deal Sukses"
            width="128"
            height="128"
            class="w-full h-full object-contain"
          />
        </div>

        <!-- Title -->
        <div class="space-y-2">
          <h2
            id="bd-success-title"
            class="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight"
          >
            Congratulations!
          </h2>

          <p class="text-sm sm:text-base text-text leading-relaxed">
            <span class="font-bold text-orange-500">BEST DEAL</span>
            <span class="text-text-muted"> iklan kamu akan dimulai pada:</span>
            <br />
            <span class="font-semibold text-text mt-1 inline-block">
              {{ scheduleDate || 'Segera' }}
            </span>
          </p>
        </div>

        <!-- Action Button -->
        <div class="pt-2">
          <button
            type="button"
            class="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-xs transition-all active:scale-98 cursor-pointer"
            @click="handleViewProduct"
          >
            Lihat iklan
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

