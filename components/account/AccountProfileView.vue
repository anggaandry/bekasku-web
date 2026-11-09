<template>
  <div class="bg-white rounded-2xl border border-border shadow-2xs overflow-hidden select-none font-outfit">
    <!-- Header with title & back (on mobile) -->
    <div class="px-5 py-4 border-b border-border flex items-center justify-between">
      <h3 class="font-bold text-base sm:text-lg text-text">
        {{ t('Ubah Profil') }}
      </h3>
    </div>

    <!-- ============================================== -->
    <!-- SECTION 1: AVATAR HEADER                       -->
    <!-- ============================================== -->
    <div class="py-6 sm:py-8 flex flex-col items-center justify-center text-center">
      <div class="relative cursor-pointer group" @click="triggerFileInput">
        <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-surface-2 border-2 border-border flex items-center justify-center shadow-xs">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            :alt="profile?.name || authStore.displayName"
            width="96"
            height="96"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform"
            @error="avatarLoadError = true"
          />
          <User v-else class="w-10 h-10 sm:w-12 sm:h-12 text-text-muted" />
        </div>

        <!-- Camera overlay badge (matching Mobile V3) -->
        <div
          class="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center shadow-sm hover:bg-primary-dark transition-colors"
          :title="t('Ubah Foto Profil')"
        >
          <Camera class="w-3.5 h-3.5" />
        </div>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onFileSelected"
      />

      <button
        type="button"
        class="mt-3 text-xs sm:text-sm font-bold text-primary hover:underline cursor-pointer"
        @click="triggerFileInput"
      >
        {{ t('Ubah Foto Profil') }}
      </button>
    </div>

    <!-- Divider Section (matching Mobile V3 _buildDividerSection) -->
    <div class="h-2 bg-surface-2 w-full"></div>

    <!-- ============================================== -->
    <!-- SECTION 2: INFO PROFIL                         -->
    <!-- ============================================== -->
    <div>
      <div class="px-5 pt-5 pb-2 flex items-center gap-1.5">
        <span class="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {{ t('Info Profil') }}
        </span>
        <button
          type="button"
          class="w-4 h-4 rounded-full text-text-subtle hover:text-text cursor-pointer flex items-center justify-center"
          aria-label="Info profil penjelasan"
          @click="$emit('open-tooltip', {
            title: t('Info Profil'),
            description: 'Informasi ini bersifat publik dan dapat dilihat oleh pengguna lainnya di halaman profil toko Anda.'
          })"
        >
          <Info class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Tile: Nama -->
      <div
        class="flex items-center justify-between px-5 py-3.5 border-b border-border/70 hover:bg-surface-2 transition-colors cursor-pointer group"
        @click="$emit('edit-name')"
      >
        <span class="text-xs sm:text-[13px] font-medium text-text">{{ t('Nama') }}</span>
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-xs sm:text-[13px] font-medium text-text truncate max-w-[200px] sm:max-w-xs">
            {{ profile?.name || authStore.displayName || t('Belum diatur') }}
          </span>
          <ChevronRight class="w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0" />
        </div>
      </div>

      <!-- Tile: Bio -->
      <div
        class="flex items-center justify-between px-5 py-3.5 border-b border-border/70 hover:bg-surface-2 transition-colors cursor-pointer group"
        @click="$emit('edit-bio')"
      >
        <span class="text-xs sm:text-[13px] font-medium text-text">{{ t('Bio') }}</span>
        <div class="flex items-center gap-2 min-w-0">
          <span
            class="text-xs sm:text-[13px] font-medium truncate max-w-[200px] sm:max-w-xs"
            :class="profile?.bio ? 'text-text' : 'text-text-muted'"
          >
            {{ profile?.bio || t('Tulis bio tentangmu') }}
          </span>
          <ChevronRight class="w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0" />
        </div>
      </div>
    </div>

    <!-- Divider Section -->
    <div class="h-2 bg-surface-2 w-full"></div>

    <!-- ============================================== -->
    <!-- SECTION 3: INFO PRIBADI                        -->
    <!-- ============================================== -->
    <div>
      <div class="px-5 pt-5 pb-2 flex items-center gap-1.5">
        <span class="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {{ t('Info Pribadi') }}
        </span>
        <button
          type="button"
          class="w-4 h-4 rounded-full text-text-subtle hover:text-text cursor-pointer flex items-center justify-center"
          aria-label="Info pribadi penjelasan"
          @click="$emit('open-tooltip', {
            title: t('Info Pribadi'),
            description: 'Aman, informasi pribadi bersifat rahasia. Cuman kamu yang bisa melihatnya dan tidak dibagiin ke siapa pun.'
          })"
        >
          <Info class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Tile: Email (Read-only as in mobile) -->
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-border/70 bg-white">
        <span class="text-xs sm:text-[13px] font-medium text-text">Email</span>
        <span class="text-xs sm:text-[13px] font-medium text-text-muted">
          {{ maskedEmail }}
        </span>
      </div>

      <!-- Tile: Nomor Handphone -->
      <div
        class="flex items-center justify-between px-5 py-3.5 border-b border-border/70 hover:bg-surface-2 transition-colors cursor-pointer group"
        @click="$emit('edit-phone')"
      >
        <span class="text-xs sm:text-[13px] font-medium text-text">{{ t('Nomor Handphone') }}</span>
        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-[13px] font-medium text-text">
            {{ maskedPhone }}
          </span>
          <ChevronRight class="w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0" />
        </div>
      </div>

      <!-- Tile: Tanggal Lahir -->
      <div
        class="flex items-center justify-between px-5 py-3.5 border-b border-border/70 hover:bg-surface-2 transition-colors cursor-pointer group"
        @click="$emit('edit-datebirth')"
      >
        <span class="text-xs sm:text-[13px] font-medium text-text">{{ t('Tanggal Lahir') }}</span>
        <div class="flex items-center gap-2">
          <span
            class="text-xs sm:text-[13px] font-medium"
            :class="profile?.datebirth ? 'text-text' : 'text-text-muted'"
          >
            {{ maskedDateBirth }}
          </span>
          <ChevronRight class="w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0" />
        </div>
      </div>

      <!-- Tile: Jenis Kelamin -->
      <div
        class="flex items-center justify-between px-5 py-3.5 border-b border-border/70 hover:bg-surface-2 transition-colors cursor-pointer group"
        @click="$emit('choose-gender')"
      >
        <span class="text-xs sm:text-[13px] font-medium text-text">{{ t('Jenis Kelamin') }}</span>
        <div class="flex items-center gap-2">
          <span
            class="text-xs sm:text-[13px] font-medium"
            :class="genderText !== t('Belum diatur') ? 'text-text' : 'text-text-muted'"
          >
            {{ genderText }}
          </span>
          <ChevronRight class="w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0" />
        </div>
      </div>
    </div>

    <!-- Divider Section -->
    <div class="h-2 bg-surface-2 w-full"></div>

    <!-- ============================================== -->
    <!-- SECTION 4: AKUN SOSIAL MEDIA                   -->
    <!-- ============================================== -->
    <div class="pb-6">
      <div class="px-5 pt-5 pb-2 flex items-center gap-1.5">
        <span class="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {{ t('Akun Sosial Media') }}
        </span>
        <button
          type="button"
          class="w-4 h-4 rounded-full text-text-subtle hover:text-text cursor-pointer flex items-center justify-center"
          aria-label="Akun sosial media penjelasan"
          @click="$emit('open-tooltip', {
            title: t('Akun Sosial Media'),
            description: 'Kami bantu membangun kepercayaan antara pembeli dan penjual. Identitas diverifikasi, interaksi lebih transparan, dan transaksi jadi lebih aman.'
          })"
        >
          <Info class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Tile: Instagram (persis _buildSocialTile di Mobile V3) -->
      <div
        class="flex items-center justify-between px-5 py-3.5 border-b border-border/70 hover:bg-surface-2 transition-colors cursor-pointer group"
        @click="$emit('open-social', 'instagram')"
      >
        <div class="flex items-center gap-3.5">
          <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Instagram class="w-4 h-4" />
          </div>
          <span class="text-xs sm:text-[13px] font-semibold text-text">Instagram</span>
        </div>

        <div class="flex items-center gap-1.5">
          <template v-if="profile?.instagram_verify && profile?.instagram">
            <span class="text-xs sm:text-[13px] font-semibold text-text">
              @{{ profile.instagram }}
            </span>
            <CheckCircle2 class="w-4 h-4 text-emerald-600 fill-emerald-100" />
          </template>
          <span v-else class="text-xs sm:text-[13px] font-bold text-primary group-hover:underline">
            {{ t('Sambungkan Akun') }}
          </span>
        </div>
      </div>

      <!-- Tile: TikTok (persis _buildSocialTile di Mobile V3) -->
      <div
        class="flex items-center justify-between px-5 py-3.5 border-b border-border/70 hover:bg-surface-2 transition-colors cursor-pointer group"
        @click="$emit('open-social', 'tiktok')"
      >
        <div class="flex items-center gap-3.5">
          <div class="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white shrink-0 shadow-xs">
            <Video class="w-4 h-4" />
          </div>
          <span class="text-xs sm:text-[13px] font-semibold text-text">TikTok</span>
        </div>

        <div class="flex items-center gap-1.5">
          <template v-if="profile?.tiktok_verify && profile?.tiktok">
            <span class="text-xs sm:text-[13px] font-semibold text-text">
              @{{ profile.tiktok }}
            </span>
            <CheckCircle2 class="w-4 h-4 text-emerald-600 fill-emerald-100" />
          </template>
          <span v-else class="text-xs sm:text-[13px] font-bold text-primary group-hover:underline">
            {{ t('Sambungkan Akun') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  User,
  Camera,
  Info,
  ChevronRight,
  Instagram,
  Video,
  CheckCircle2,
} from 'lucide-vue-next'
import type { ProfileData } from '~/types/account'
import { useAuthStore } from '~/stores/auth'

import { sanitizeMediaUrl } from '~/utils/media'

const props = defineProps<{
  profile: ProfileData | null
}>()

const emit = defineEmits<{
  (e: 'edit-name'): void
  (e: 'edit-bio'): void
  (e: 'edit-phone'): void
  (e: 'edit-datebirth'): void
  (e: 'choose-gender'): void
  (e: 'open-social', type: 'instagram' | 'tiktok'): void
  (e: 'upload-avatar', file: File): void
  (e: 'open-tooltip', info: { title: string; description: string }): void
}>()

const authStore = useAuthStore()
const { t } = useLocale()
const fileInputRef = ref<HTMLInputElement | null>(null)

const avatarLoadError = ref(false)

const avatarUrl = computed(() => {
  if (avatarLoadError.value) return ''
  const raw = props.profile?.avatar || authStore.userAvatar || ''
  if (!raw) return ''
  return sanitizeMediaUrl(raw)
})

watch(
  () => props.profile?.avatar,
  () => {
    avatarLoadError.value = false
  }
)

const maskedEmail = computed(() => {
  const email = props.profile?.email || authStore.user?.email || ''
  if (!email || !email.includes('@')) return email || '-'
  const [name, domain] = email.split('@')
  if (name.length <= 2) return `${name}***@${domain}`
  return `${name.substring(0, 2)}*******${name.substring(name.length - 2)}@${domain}`
})

const maskedPhone = computed(() => {
  const phone = props.profile?.phone || authStore.user?.phone || ''
  if (!phone || phone.length <= 4) return phone || '-'
  return `*********${phone.substring(phone.length - 2)}`
})

const maskedDateBirth = computed(() => {
  const date = props.profile?.datebirth || ''
  if (!date) return t('Belum diatur')
  if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(date)) {
    const parts = date.split(/[-/]/)
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return date
})

const genderText = computed(() => {
  const g = props.profile?.gender
  if (g === 'L') return t('Laki-laki')
  if (g === 'P') return t('Perempuan')
  return t('Belum diatur')
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const file = target.files[0]
  emit('upload-avatar', file)
  target.value = ''
}
</script>
