<template>
  <AppModal
    :model-value="modelValue"
    max-width="max-w-md"
    :show-close-button="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="space-y-5 font-outfit select-none">
      <!-- Header -->
      <div class="flex items-center gap-3 pb-3 border-b border-border/80">
        <button
          type="button"
          class="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text cursor-pointer transition-colors"
          aria-label="Kembali"
          @click="handleClose"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h3 class="font-bold text-base sm:text-lg text-text">
          {{ type === 'instagram' ? 'Instagram Connect' : 'TikTok Connect' }}
        </h3>
      </div>

      <!-- ============================================== -->
      <!-- STATE 1: ALREADY CONNECTED & VERIFIED         -->
      <!-- ============================================== -->
      <div v-if="isVerified" class="text-center space-y-4 py-2">
        <div
          class="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white"
          :class="type === 'instagram' ? 'bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]' : 'bg-black'"
        >
          <Instagram v-if="type === 'instagram'" class="w-8 h-8" />
          <Video v-else class="w-8 h-8" />
        </div>

        <div>
          <h4 class="font-bold text-base text-text">
            {{ type === 'instagram' ? 'Akun Instagram Terhubung' : 'Akun TikTok Terhubung' }}
          </h4>
          <p class="text-sm font-bold text-primary mt-1">
            @{{ username }}
          </p>
          <p class="text-xs text-text-muted mt-2 leading-relaxed">
            Akun Anda telah terverifikasi dan terhubung ke profil BekasKu. Ini meningkatkan reputasi dan kepercayaan calon pembeli.
          </p>
        </div>

        <div class="space-y-2.5 pt-3">
          <a
            :href="profileUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full h-11 rounded-xl border border-border bg-white hover:bg-surface-2 text-text font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <span>Buka Profil {{ type === 'instagram' ? 'Instagram' : 'TikTok' }}</span>
            <ExternalLink class="w-4 h-4 text-text-muted" />
          </a>

          <button
            type="button"
            :disabled="isSubmitting"
            class="w-full h-11 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            @click="$emit('disconnect', type)"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <span>Putuskan Sambungan Akun</span>
          </button>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- STATE 2: NOT CONNECTED (STEP 1: ENTER USERNAME) -->
      <!-- ============================================== -->
      <div v-else-if="currentStep === 1" class="space-y-4">
        <p class="text-xs sm:text-[13px] text-text-muted leading-relaxed">
          Pastikan pakai username {{ type === 'instagram' ? 'Instagram' : 'TikTok' }} dengan benar dan valid.
        </p>

        <div class="space-y-2">
          <label class="block text-xs font-bold text-text">
            Username
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">@</span>
            <input
              id="account-social-username-input"
              v-model="inputUsername"
              name="social_username"
              aria-label="Username Sosial Media"
              type="text"
              maxlength="40"
              :placeholder="type === 'instagram' ? 'username_instagram' : 'username_tiktok'"
              class="w-full pl-8 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-hidden text-xs sm:text-sm bg-white text-text font-medium transition-colors"
              @keyup.enter="handleNextToStep2"
            />
          </div>
          <p v-if="localError" class="text-xs text-red-500 font-medium">
            {{ localError }}
          </p>
        </div>

        <div class="pt-2">
          <button
            type="button"
            :disabled="!inputUsername.trim() || isSubmitting"
            class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs active:scale-[0.99]"
            @click="handleNextToStep2"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <span>Lanjut ke Verifikasi</span>
          </button>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- STATE 3: STEP 2 (COPY CODE & VERIFY)           -->
      <!-- ============================================== -->
      <div v-else class="space-y-4">
        <p class="text-xs sm:text-[13px] text-text-muted leading-relaxed">
          Salin kode di bawah ini dan masukkan ke dalam bio {{ type === 'instagram' ? 'Instagram' : 'TikTok' }} Anda untuk verifikasi kepemilikan akun.
        </p>

        <!-- Verification Code Card -->
        <div class="p-4 rounded-xl bg-surface-2 border border-border flex items-center justify-between gap-3">
          <div>
            <span class="text-[11px] text-text-muted block">Kode Verifikasi:</span>
            <span class="text-base sm:text-lg font-bold font-mono text-primary tracking-wider">
              {{ generatedCode || '-' }}
            </span>
          </div>
          <button
            type="button"
            :disabled="!generatedCode"
            class="px-3.5 py-2 rounded-lg bg-white border border-border text-xs font-semibold text-text hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            @click="copyCode"
          >
            <Check v-if="isCopied" class="w-3.5 h-3.5 text-emerald-600" />
            <Copy v-else class="w-3.5 h-3.5" />
            <span>{{ isCopied ? 'Tersalin' : 'Salin Kode' }}</span>
          </button>
        </div>

        <!-- Instructions -->
        <div class="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-1.5 leading-relaxed">
          <p class="font-bold">Langkah Verifikasi:</p>
          <ol class="list-decimal pl-4 space-y-1">
            <li>Buka profil {{ type === 'instagram' ? 'Instagram' : 'TikTok' }} kamu dan edit bio.</li>
            <li>Tempelkan kode di atas pada bio profil.</li>
            <li>Klik tombol <strong>Verifikasi Sekarang</strong> di bawah.</li>
          </ol>
        </div>

        <div class="pt-2 space-y-2">
          <button
            type="button"
            :disabled="isSubmitting"
            class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs active:scale-[0.99]"
            @click="handleVerify"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <span>Verifikasi Sekarang</span>
          </button>

          <button
            type="button"
            class="w-full h-10 rounded-xl border border-border text-xs font-medium text-text hover:bg-surface-2 transition-colors cursor-pointer"
            @click="currentStep = 1"
          >
            Kembali &amp; Ubah Username
          </button>
        </div>
      </div>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  ArrowLeft,
  Instagram,
  Video,
  Copy,
  Check,
  ExternalLink,
  Loader2,
} from 'lucide-vue-next'
import AppModal from '~/components/shared/AppModal.vue'

const props = defineProps<{
  modelValue: boolean
  type: 'instagram' | 'tiktok'
  username?: string
  isVerified?: boolean
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'verify', payload: { type: 'instagram' | 'tiktok'; username: string }): void
  (e: 'disconnect', type: 'instagram' | 'tiktok'): void
  (e: 'request-code', type: 'instagram' | 'tiktok'): void
}>()

const { getSocialCode } = useProfile()

const currentStep = ref(1)
const inputUsername = ref('')
const generatedCode = ref('')
const isCopied = ref(false)
const localError = ref('')

const profileUrl = computed(() => {
  const u = props.username?.replace('@', '').trim() || ''
  return props.type === 'instagram'
    ? `https://instagram.com/${u}`
    : `https://tiktok.com/@${u}`
})

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      currentStep.value = 1
      isCopied.value = false
      localError.value = ''
      inputUsername.value = props.username?.replace('@', '').trim() || ''
      if (!props.isVerified && inputUsername.value) {
        // Pre-fetch code
        fetchCode()
      }
    }
  },
  { immediate: true }
)

async function fetchCode() {
  const code = await getSocialCode(props.type)
  generatedCode.value = code || ''
}

async function handleNextToStep2() {
  const clean = inputUsername.value.replace('@', '').trim()
  if (!clean) {
    localError.value = 'Username tidak boleh kosong'
    return
  }
  localError.value = ''
  await fetchCode()
  if (!generatedCode.value) {
    localError.value = 'Gagal memuat kode verifikasi dari server. Silakan coba lagi.'
    return
  }
  currentStep.value = 2
}

function copyCode() {
  if (!generatedCode.value) return
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(generatedCode.value)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2500)
  }
}

function handleVerify() {
  const clean = inputUsername.value.replace('@', '').trim()
  emit('verify', { type: props.type, username: clean })
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>
