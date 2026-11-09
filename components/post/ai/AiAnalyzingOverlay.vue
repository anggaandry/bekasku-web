<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    active: boolean
    inModal?: boolean
  }>(),
  {
    inModal: false,
  },
)
</script>

<template>
  <!-- Inline Modal Mode -->
  <div
    v-if="inModal && active"
    class="py-12 sm:py-16 px-6 flex flex-col items-center justify-center text-center select-none font-outfit"
    role="status"
    aria-live="polite"
  >
    <div class="relative w-36 h-36 flex items-center justify-center mb-8">
      <div class="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-60" />
      <div
        class="relative w-28 h-28 rounded-full bg-white shadow-xl shadow-primary/15 border border-primary/20 overflow-hidden flex items-center justify-center"
      >
        <div
          class="absolute inset-x-0 h-10 bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0 animate-scan pointer-events-none"
        />
        <div
          class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 text-white flex items-center justify-center shadow-md shadow-primary/30"
        >
          <Sparkles class="w-7 h-7 animate-pulse" aria-hidden="true" />
        </div>
      </div>
    </div>

    <h3
      class="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent animate-pulse"
    >
      AI Sedang Bekerja
    </h3>

    <p class="text-xs sm:text-sm text-text-muted mt-2.5 leading-relaxed max-w-xs">
      Menganalisis foto dan menyusun deskripsi terbaik untuk barangmu...
    </p>

    <div class="flex items-center gap-2 mt-6">
      <span class="w-2.5 h-2.5 rounded-full bg-primary animate-bounce delay-0" />
      <span class="w-2.5 h-2.5 rounded-full bg-primary animate-bounce delay-150" />
      <span class="w-2.5 h-2.5 rounded-full bg-primary animate-bounce delay-300" />
    </div>
  </div>

  <!-- Full-Screen Overlay Mode (Standalone /post/ai Page) -->
  <Teleport v-else-if="!inModal" to="body">
    <div
      v-if="active"
      class="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 select-none font-outfit animate-in fade-in duration-300"
      role="status"
      aria-live="polite"
    >
      <div class="flex flex-col items-center max-w-sm text-center">
        <!-- Glowing Core with Single Outer Ring & Scanning Beam -->
        <div class="relative w-36 h-36 flex items-center justify-center mb-10">
          <div class="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-60" />

          <!-- Center Circular Badge -->
          <div
            class="relative w-28 h-28 rounded-full bg-white shadow-xl shadow-primary/15 border border-primary/20 overflow-hidden flex items-center justify-center"
          >
            <!-- Vertical Scanning Light Beam -->
            <div
              class="absolute inset-x-0 h-10 bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0 animate-scan pointer-events-none"
            />

            <!-- Center Sparkles Icon with Gradient Tint -->
            <div
              class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 text-white flex items-center justify-center shadow-md shadow-primary/30"
            >
              <Sparkles class="w-7 h-7 animate-pulse" aria-hidden="true" />
            </div>
          </div>
        </div>

        <!-- Title -->
        <h2
          class="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent animate-pulse"
        >
          AI Sedang Bekerja
        </h2>

        <!-- Subtitle -->
        <p class="text-sm text-text-muted mt-3 leading-relaxed max-w-xs">
          Menganalisis foto dan menyusun deskripsi terbaik untuk barangmu...
        </p>

        <!-- Progress Dots -->
        <div class="flex items-center gap-2 mt-8">
          <span class="w-2.5 h-2.5 rounded-full bg-primary animate-bounce delay-0" />
          <span class="w-2.5 h-2.5 rounded-full bg-primary animate-bounce delay-150" />
          <span class="w-2.5 h-2.5 rounded-full bg-primary animate-bounce delay-300" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes scan {
  0% {
    top: -2.5rem;
  }
  50% {
    top: calc(100% - 2.5rem);
  }
  100% {
    top: -2.5rem;
  }
}

.animate-scan {
  animation: scan 2.5s ease-in-out infinite;
}

.delay-0 {
  animation-delay: 0ms;
}
.delay-150 {
  animation-delay: 150ms;
}
.delay-300 {
  animation-delay: 300ms;
}
</style>
