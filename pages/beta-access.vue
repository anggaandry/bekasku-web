<template>
  <div class="min-h-screen bg-[#0F1115] text-white flex flex-col justify-between p-4 sm:p-8 font-outfit relative overflow-hidden">
    <!-- Subtle Background Glow -->
    <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#E31B23]/15 blur-3xl pointer-events-none" />
    <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#2563EB]/15 blur-3xl pointer-events-none" />

    <!-- Top Bar -->
    <header class="max-w-5xl w-full mx-auto flex items-center justify-between z-10">
      <div class="flex items-center gap-3">
        <img src="/icon_only.png" alt="BekasKu" class="h-8 w-8 rounded-lg object-contain" />
        <span class="text-base font-extrabold tracking-tight text-white">BekasKu</span>
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#E31B23]/20 text-[#FF5A60] border border-[#E31B23]/30">
          Private Beta Preview
        </span>
      </div>
      <div class="hidden sm:flex items-center gap-2 text-xs text-gray-400">
        <ShieldCheck class="w-4 h-4 text-emerald-400" />
        <span>Sandbox Environment • Investor &amp; QA Portal</span>
      </div>
    </header>

    <!-- Center Card -->
    <main class="max-w-md w-full mx-auto my-auto z-10 py-8">
      <div class="bg-[#16191E] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-[#E31B23]/15 border border-[#E31B23]/30 flex items-center justify-center shrink-0">
            <Lock class="w-6 h-6 text-[#E31B23]" />
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-white tracking-tight">
              Akses Terbatas BekasKu Web V3
            </h1>
            <p class="text-xs text-gray-400 mt-0.5">
              Khusus peninjauan Investor &amp; pengujian Tim Quality Assurance
            </p>
          </div>
        </div>

        <p class="text-xs text-gray-300 leading-relaxed bg-white/5 rounded-2xl p-3.5 border border-white/5">
          Lingkungan pratinjau ini terhubung ke server <strong>Sandbox BekasKu V3</strong> untuk menjaga keamanan data transaksi publik selama tahap evaluasi pra-rilis.
        </p>

        <form class="space-y-4" @submit.prevent="handleUnlock">
          <div>
            <label for="beta-pin-input" class="block text-xs font-semibold text-gray-300 mb-1.5">
              Kode Akses / PIN Pratinjau
            </label>
            <div class="relative">
              <KeyRound class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="beta-pin-input"
                v-model="pinInput"
                type="password"
                autocomplete="off"
                placeholder="Masukkan kode akses (misal: BKK2026)"
                class="w-full h-11 pl-10 pr-4 rounded-xl bg-[#0F1115] border border-white/15 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E31B23] transition-colors font-mono tracking-wider"
                @input="errorMsg = ''"
              />
            </div>
            <p v-if="errorMsg" class="mt-2 text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" />
              <span>{{ errorMsg }}</span>
            </p>
          </div>

          <button
            type="submit"
            :disabled="!pinInput.trim() || isSubmitting"
            class="w-full h-11 rounded-xl bg-[#E31B23] hover:bg-[#c8161d] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Buka Pratinjau BekasKu Web</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </form>

        <div class="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span>Akses berlaku otomatis 30 hari</span>
          <a
            href="https://qa.bekasku.id"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-300 hover:text-white underline underline-offset-2"
          >
            Portal QA Tracker
          </a>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="max-w-5xl w-full mx-auto text-center text-xs text-gray-500 z-10">
      &copy; {{ new Date().getFullYear() }} PT Jantaka Ladang Unggul — BekasKu Ecosystem
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ShieldCheck, Lock, KeyRound, ArrowRight, AlertCircle } from 'lucide-vue-next'

definePageMeta({
  layout: false,
})

useHead({
  title: 'Private Beta Access — BekasKu Web Marketplace V3',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const route = useRoute()
const config = useRuntimeConfig()
const pinInput = ref('')
const errorMsg = ref('')
const isSubmitting = ref(false)

const accessCookie = useCookie<string | null>('bkk_beta_access', {
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
  sameSite: 'lax',
})

function handleUnlock() {
  const configuredPin = String(config.public.betaPin || 'BKK2026').toUpperCase()
  const validPins = new Set([configuredPin, 'BKK2026', 'BEKASKU2026', 'INVESTOR2026', 'QA2026'])
  const entered = pinInput.value.trim().toUpperCase()

  if (!validPins.has(entered)) {
    errorMsg.value = 'Kode akses tidak valid. Gunakan PIN resmi Investor atau QA.'
    return
  }

  isSubmitting.value = true
  accessCookie.value = 'granted'

  const redirectTarget = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
    ? route.query.redirect
    : '/'

  navigateTo(redirectTarget, { replace: true })
}
</script>
