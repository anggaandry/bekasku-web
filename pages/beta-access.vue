<template>
  <div class="min-h-screen bg-[#F9F9F9] text-text flex flex-col justify-between font-outfit">
    <!-- Top BekasKu Brand Bar -->
    <header class="w-full bg-primary text-white py-3 px-4 sm:px-6 shadow-xs">
      <div class="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <img src="/images/logo_white.png" alt="BekasKu" class="h-7 w-auto object-contain" />
          <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-white">
            Preview Beta
          </span>
        </div>
        <span class="hidden sm:inline text-xs text-white/85 font-medium">
          Sandbox Environment
        </span>
      </div>
    </header>

    <!-- Center Clean Card -->
    <main class="w-full max-w-md mx-auto px-4 py-8 my-auto">
      <div class="bg-white rounded-2xl border border-border-light shadow-xs p-6 sm:p-8 space-y-5">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Lock class="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-text tracking-tight">
              Akses Pratinjau BekasKu
            </h1>
            <p class="text-xs text-text-muted mt-0.5">
              Masukkan PIN akses untuk membuka pratinjau beta.
            </p>
          </div>
        </div>

        <form class="space-y-4" @submit.prevent="handleUnlock">
          <div>
            <label for="beta-pin-input" class="block text-xs font-semibold text-text mb-1.5">
              Kode Akses / PIN
            </label>
            <div class="relative">
              <KeyRound class="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="beta-pin-input"
                v-model="pinInput"
                :type="showPin ? 'text' : 'password'"
                autocomplete="off"
                placeholder="Masukkan kode akses"
                class="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-2 border border-border text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary transition-colors font-mono tracking-wider"
                @input="errorMsg = ''"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                :aria-label="showPin ? 'Sembunyikan PIN' : 'Lihat PIN'"
                @click="showPin = !showPin"
              >
                <EyeOff v-if="showPin" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="errorMsg" class="mt-2 text-xs text-danger flex items-center gap-1.5">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" />
              <span>{{ errorMsg }}</span>
            </p>
          </div>

          <button
            type="submit"
            :disabled="!pinInput.trim() || isSubmitting"
            class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>{{ isSubmitting ? 'Memverifikasi...' : 'Masuk ke Pratinjau' }}</span>
            <ArrowRight v-if="!isSubmitting" class="w-4 h-4" />
          </button>
        </form>
      </div>
    </main>

    <!-- Simple Footer -->
    <footer class="w-full py-4 px-4 text-center text-xs text-text-muted">
      &copy; {{ new Date().getFullYear() }} BekasKu — PT Jantaka Ladang Unggul
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Lock, KeyRound, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-vue-next'

definePageMeta({
  layout: false,
})

useHead({
  title: 'Akses Pratinjau — BekasKu',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const route = useRoute()
const pinInput = ref('')
const showPin = ref(false)
const errorMsg = ref('')
const isSubmitting = ref(false)

async function handleUnlock() {
  const entered = pinInput.value.trim()
  if (!entered || isSubmitting.value) return

  isSubmitting.value = true
  errorMsg.value = ''

  try {
    await $fetch('/api/beta-unlock', {
      method: 'POST',
      body: { pin: entered },
    })

    const redirectTarget = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/'

    await navigateTo(redirectTarget, { replace: true })
  } catch {
    errorMsg.value = 'Kode akses tidak valid. Silakan periksa kembali.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
