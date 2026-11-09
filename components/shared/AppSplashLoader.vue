<script setup lang="ts">
const isReady = ref(false)
const shouldRender = ref(true)

onMounted(() => {
  // Tunggu microtask dan paint pertama selesai
  nextTick(() => {
    // Beri sedikit buffer transisi agar tidak flickering
    setTimeout(() => {
      isReady.value = true
      setTimeout(() => {
        shouldRender.value = false
      }, 350) // Durasi fade-out
    }, 150)
  })
})
</script>

<template>
  <div
    v-if="shouldRender"
    class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-350 ease-out select-none"
    :class="isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'"
    aria-hidden="true"
  >
    <!-- Brand Centerpiece -->
    <div class="flex flex-col items-center">
      <!-- Icon Logo BekasKu Red -->
      <div class="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
        <!-- Subtle pulsing background halo -->
        <div class="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-35" />
        <img
          src="/images/icon_only.png"
          alt="BekasKu"
          width="96"
          height="96"
          class="relative w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-sm transition-transform duration-300 transform scale-100"
        />
      </div>

      <!-- Brand Wordmark Text without Double Icon -->
      <span class="text-xl sm:text-2xl font-bold tracking-tight text-primary font-outfit mt-3 select-none">
        Bekasku
      </span>

      <!-- Shimmer Progress Line -->
      <div class="w-36 h-1 bg-surface-2 rounded-full overflow-hidden mt-6 relative">
        <div class="splash-shimmer-bar h-full bg-primary rounded-full" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes splash-shimmer {
  0% {
    width: 0%;
    transform: translateX(-100%);
  }
  50% {
    width: 70%;
    transform: translateX(30%);
  }
  100% {
    width: 100%;
    transform: translateX(100%);
  }
}

.splash-shimmer-bar {
  animation: splash-shimmer 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
</style>

