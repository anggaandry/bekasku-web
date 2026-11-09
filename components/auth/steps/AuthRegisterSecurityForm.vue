<script setup lang="ts">
import { Eye, EyeOff, Camera, ArrowRight } from 'lucide-vue-next'
import { useAuthModal } from '~/composables/useAuthModal'
import { usePasswordRules } from '~/composables/usePasswordRules'
import AuthStepHeader from '~/components/auth/AuthStepHeader.vue'
import AuthPasswordRules from '~/components/auth/AuthPasswordRules.vue'

const authModal = useAuthModal()
const currentStep = computed(() => authModal.step.value)
const draft = computed(() => authModal.registerDraft.value)

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const selectedAvatarFile = ref<File | null>(null)
const avatarPreviewUrl = ref<string>(draft.value.avatarUrl || '/images/auth/default_avatar.png')
const fileInputRef = ref<HTMLInputElement | null>(null)

const passwordRef = computed(() => draft.value.password)
const { isValid: isPasswordValid } = usePasswordRules(passwordRef)

function triggerFileSelect() {
  fileInputRef.value?.click()
}

function handleAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  selectedAvatarFile.value = file
  avatarPreviewUrl.value = URL.createObjectURL(file)
}
</script>

<template>
  <div>
    <!-- STEP 4: REGISTER PASSWORD -->
    <template v-if="currentStep === 'register-password'">
      <AuthStepHeader
        title="Buat Kata Sandi"
        subtitle="Langkah terakhir untuk mengamankan akun BekasKu Anda."
      />

      <form class="space-y-3.5" @submit.prevent="authModal.submitRegisterAccount()">
        <div>
          <label for="register-new-password" class="block text-xs font-semibold text-text mb-1.5">Kata Sandi</label>
          <div class="relative">
            <input
              id="register-new-password"
              v-model="draft.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Minimal 8 karakter"
              class="w-full h-11 px-3.5 pr-10 rounded-xl border border-border bg-white text-xs sm:text-sm text-text outline-none focus:border-primary"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
              :aria-label="showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <AuthPasswordRules :password="draft.password" />

        <div>
          <label for="register-confirm-password" class="block text-xs font-semibold text-text mb-1.5">Konfirmasi Kata Sandi</label>
          <div class="relative">
            <input
              id="register-confirm-password"
              v-model="draft.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Ketik ulang kata sandi"
              class="w-full h-11 px-3.5 pr-10 rounded-xl border border-border bg-white text-xs sm:text-sm text-text outline-none focus:border-primary"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
              :aria-label="showConfirmPassword ? 'Sembunyikan konfirmasi sandi' : 'Lihat konfirmasi sandi'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <EyeOff v-if="showConfirmPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="
            authModal.isSubmitting.value ||
            !isPasswordValid ||
            draft.password !== draft.confirmPassword
          "
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>{{ authModal.isSubmitting.value ? 'Membuat Akun...' : 'Buat Akun Sekarang' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>
    </template>

    <!-- STEP 4: REGISTER AVATAR UPLOAD (OPTIONAL) -->
    <template v-else-if="currentStep === 'register-avatar'">
      <AuthStepHeader
        title="Pasang Foto Profil"
        subtitle="Akun berhasil dibuat! Tambahkan foto profil agar toko dan profil Anda lebih dikenal."
      />

      <div class="py-3 flex flex-col items-center">
        <div class="relative w-24 h-24 rounded-full border-2 border-primary/30 p-1 bg-surface-2">
          <img
            :src="avatarPreviewUrl"
            alt="Preview Foto Profil"
            width="92"
            height="92"
            class="w-full h-full rounded-full object-cover"
          />
          <button
            type="button"
            class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white shadow-sm flex items-center justify-center hover:bg-primary-dark transition-colors cursor-pointer"
            aria-label="Pilih Foto"
            @click="triggerFileSelect"
          >
            <Camera class="w-4 h-4" />
          </button>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleAvatarChange"
        />

        <button
          type="button"
          class="mt-2.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
          @click="triggerFileSelect"
        >
          {{ selectedAvatarFile ? 'Ganti Foto Lain' : 'Pilih Foto dari Perangkat' }}
        </button>
      </div>

      <div class="mt-4 space-y-2">
        <button
          type="button"
          :disabled="authModal.isSubmitting.value"
          class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          @click="authModal.submitRegisterAvatar(selectedAvatarFile)"
        >
          <span>{{ authModal.isSubmitting.value ? 'Mengunggah...' : 'Simpan & Mulai Jelajah' }}</span>
        </button>

        <button
          type="button"
          :disabled="authModal.isSubmitting.value"
          class="w-full h-10 rounded-xl text-xs font-semibold text-text-muted hover:bg-surface-2 transition-colors cursor-pointer"
          @click="authModal.openLocationAsk()"
        >
          Lewati untuk Sekarang
        </button>
      </div>
    </template>
  </div>
</template>

