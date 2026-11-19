<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Cookie, X, ShieldCheck } from 'lucide-vue-next'
import { useCookieConsent } from '~/composables/useCookieConsent'

const route = useRoute()
const {
  consent,
  hasDecided,
  isPreferencesOpen,
  acceptAll,
  rejectNonEssential,
  saveConsent,
  openPreferences,
  closePreferences,
} = useCookieConsent()

const isMounted = ref(false)
const analyticsEnabled = ref(false)
const marketingEnabled = ref(false)

onMounted(() => {
  isMounted.value = true
})

watch(
  isPreferencesOpen,
  (open) => {
    if (open) {
      analyticsEnabled.value = Boolean(consent.value?.analytics)
      marketingEnabled.value = Boolean(consent.value?.marketing)
    }
  },
  { immediate: true }
)

const shouldShowBanner = computed(() => {
  if (!isMounted.value) return false
  if (hasDecided.value) return false
  if (route.path === '/beta-access') return false
  return true
})
</script>

<template>
  <div>
    <!-- Cookie Consent Floating Card (Mobile above bottom nav, Desktop bottom-right) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <aside
        v-if="shouldShowBanner"
        role="dialog"
        aria-label="Pengaturan Cookie"
        class="fixed bottom-[72px] md:bottom-5 left-3 right-3 md:left-auto md:right-5 md:w-[400px] z-40 bg-white border border-border rounded-2xl shadow-lg p-4 space-y-3 font-outfit"
      >
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-[#FCE8EA] text-primary flex items-center justify-center shrink-0">
            <Cookie class="w-4.5 h-4.5" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-bold text-text">
              Pengaturan Cookie BekasKu
            </h3>
            <p class="text-xs text-text-muted leading-relaxed mt-1">
              Kami menggunakan cookie esensial untuk menjalankan situs dan cookie opsional untuk analitik serta personalisasi.
              <NuxtLink to="/policy/privacy" class="text-primary font-semibold hover:underline">
                Kebijakan Privasi
              </NuxtLink>
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            class="text-xs font-semibold text-text-muted hover:text-text px-2 py-1.5 cursor-pointer"
            @click="openPreferences"
          >
            Atur
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-text transition-colors cursor-pointer"
              @click="rejectNonEssential"
            >
              Tolak
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-colors cursor-pointer"
              @click="acceptAll"
            >
              Terima Semua
            </button>
          </div>
        </div>
      </aside>
    </Transition>

    <!-- Cookie Preferences Modal / Bottom Sheet -->
    <Teleport to="body">
      <div
        v-if="isPreferencesOpen"
        class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit"
        @click.self="closePreferences"
      >
        <div class="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-2 border-b border-border-light">
            <div class="flex items-center gap-2">
              <ShieldCheck class="w-5 h-5 text-primary" />
              <h3 class="text-base font-bold text-text">
                Preferensi Cookie
              </h3>
            </div>
            <button
              type="button"
              class="p-1.5 rounded-full hover:bg-surface-2 text-text-muted hover:text-text cursor-pointer"
              aria-label="Tutup"
              @click="closePreferences"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <p class="text-xs text-text-muted leading-relaxed">
            Kelola jenis cookie yang diizinkan. Menolak cookie opsional tidak akan membatasi akses belanja, keranjang, maupun login Anda.
          </p>

          <div class="space-y-3">
            <!-- Essential (Always On) -->
            <div class="p-3.5 rounded-xl border border-border-light bg-surface-2/60 flex items-start justify-between gap-3">
              <div>
                <div class="text-xs font-bold text-text">Cookie Esensial</div>
                <p class="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                  Diperlukan untuk sesi login, keranjang belanja, keamanan, dan bahasa.
                </p>
              </div>
              <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                Selalu Aktif
              </span>
            </div>

            <!-- Analytics -->
            <label class="p-3.5 rounded-xl border border-border-light flex items-start justify-between gap-3 cursor-pointer hover:border-gray-300">
              <div>
                <div class="text-xs font-bold text-text">Analitik &amp; Performa</div>
                <p class="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                  Membantu kami mengukur performa halaman dan meningkatkan pengalaman pengguna.
                </p>
              </div>
              <input
                v-model="analyticsEnabled"
                type="checkbox"
                class="mt-0.5 h-4 w-4 accent-primary rounded cursor-pointer shrink-0"
              />
            </label>

            <!-- Marketing -->
            <label class="p-3.5 rounded-xl border border-border-light flex items-start justify-between gap-3 cursor-pointer hover:border-gray-300">
              <div>
                <div class="text-xs font-bold text-text">Pemasaran &amp; Personalisasi</div>
                <p class="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                  Digunakan untuk menampilkan promo dan rekomendasi yang lebih relevan.
                </p>
              </div>
              <input
                v-model="marketingEnabled"
                type="checkbox"
                class="mt-0.5 h-4 w-4 accent-primary rounded cursor-pointer shrink-0"
              />
            </label>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-border-light">
            <button
              type="button"
              class="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-text cursor-pointer"
              @click="saveConsent(analyticsEnabled, marketingEnabled)"
            >
              Simpan Pilihan
            </button>
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold cursor-pointer"
              @click="acceptAll"
            >
              Terima Semua
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
