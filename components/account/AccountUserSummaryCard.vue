<template>
  <div class="hidden lg:block bg-white rounded-2xl p-5 border border-border shadow-2xs space-y-4 font-outfit">
    <div class="flex items-center gap-3.5">
      <!-- Avatar with Camera Trigger -->
      <div class="relative shrink-0">
        <div class="w-16 h-16 rounded-full overflow-hidden bg-surface-2 border border-border flex items-center justify-center">
          <img
            v-if="userAvatarUrl"
            :src="userAvatarUrl"
            :alt="profile?.name || authStore.displayName"
            width="64"
            height="64"
            class="w-full h-full object-cover"
            @error="avatarError = true"
          />
          <CircleUser v-else class="w-8 h-8 text-text-muted" aria-hidden="true" />
        </div>
        <button
          type="button"
          class="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-xs hover:bg-primary-dark transition-colors cursor-pointer"
          aria-label="Ubah Foto Profil"
          title="Ubah Foto Profil"
          @click="fileInputRef?.click()"
        >
          <Camera class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="hidden"
          @change="handleFileChange"
        />
      </div>

      <!-- Name & Status -->
      <div class="min-w-0 flex-1">
        <h2 class="font-bold text-base text-text truncate">
          {{ profile?.name || authStore.displayName }}
        </h2>
        <p class="text-xs text-text-muted truncate mt-0.5">
          {{ profile?.email || profile?.phone || authStore.user?.email || authStore.user?.phone || '-' }}
        </p>

        <!-- Official Badges (Strict Rule 11: BekasKu+ only if approved or anne14) -->
        <div class="flex flex-wrap items-center gap-1.5 mt-2">
          <div
            v-if="isApprovedBekaskuPlus"
            class="bg-red-50 border border-red-200 rounded-md px-1.5 py-0.5 inline-flex items-center shrink-0"
          >
            <img
              src="/images/bekasku_plus_variant_6_horizontal.png"
              alt="BekasKu+"
              width="60"
              height="12"
              class="h-3 w-auto object-contain"
            />
          </div>
          <div
            v-if="isVipActive"
            class="bg-amber-50 border border-amber-200 rounded-md px-1.5 py-0.5 text-amber-800 text-[10px] font-bold inline-flex items-center gap-1 shrink-0"
          >
            <Crown class="w-3 h-3 text-amber-600 fill-amber-500" aria-hidden="true" />
            <span>VIP</span>
          </div>
          <span v-if="profile?.member_since" class="text-[11px] text-text-muted">
            {{ t('Member sejak') }} {{ profile.member_since }}
          </span>
        </div>
      </div>
    </div>

    <!-- Followers / Following Counter -->
    <div class="grid grid-cols-2 gap-2 pt-3 border-t border-border/70 text-center text-xs">
      <div class="p-2 rounded-xl bg-surface-2 border border-border">
        <span class="font-bold text-text font-outfit text-sm block">
          {{ profile?.total_followers ?? authStore.user?.follower_count ?? 0 }}
        </span>
        <span class="text-text-muted text-[11px]">{{ t('Pengikut') }}</span>
      </div>
      <div class="p-2 rounded-xl bg-surface-2 border border-border">
        <span class="font-bold text-text font-outfit text-sm block">
          {{ profile?.total_following ?? authStore.user?.following_count ?? 0 }}
        </span>
        <span class="text-text-muted text-[11px]">{{ t('Mengikuti') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CircleUser, Camera, Crown } from 'lucide-vue-next'
import type { ProfileData } from '~/types/account'
import { useAuthStore } from '~/stores/auth'
import { useLocale } from '~/composables/useLocale'
import { sanitizeMediaUrl } from '~/utils/media'

const { t } = useLocale()

const props = defineProps<{
  profile: ProfileData | null
}>()

const emit = defineEmits<{
  (e: 'upload-avatar', file: File): void
}>()

const authStore = useAuthStore()
const fileInputRef = ref<HTMLInputElement | null>(null)
const avatarError = ref(false)

const userAvatarUrl = computed(() => {
  if (avatarError.value) return ''
  const raw = props.profile?.avatar || authStore.userAvatar || ''
  if (!raw) return ''
  return sanitizeMediaUrl(raw)
})

const isApprovedBekaskuPlus = computed(() => {
  const username = (props.profile?.username || authStore.user?.username || '').toLowerCase()
  return props.profile?.bekasku_plus_status === 'approved' || username === 'anne14'
})

const isVipActive = computed(() => {
  return props.profile?.subscribe === 'yes' || authStore.user?.subscribe === 'yes'
})

watch(
  () => props.profile?.avatar,
  () => {
    avatarError.value = false
  }
)

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const file = target.files[0]
  if (file) {
    emit('upload-avatar', file)
  }
  target.value = ''
}
</script>

