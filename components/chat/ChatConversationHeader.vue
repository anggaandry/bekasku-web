<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ArrowLeft,
  MoreVertical,
  ShieldAlert,
  Ban,
  Maximize2,
  X,
  Crown,
  User as UserIcon,
} from 'lucide-vue-next'
import type { ChatPartnerProfile } from '~/types/chat'

const props = defineProps<{
  partner: ChatPartnerProfile
  statusText: string
  isTyping?: boolean
  isBlocked?: boolean
  showBackButton?: boolean
  isFloating?: boolean
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'open-security'): void
  (e: 'open-block'): void
  (e: 'expand-fullpage'): void
  (e: 'minimize-floating'): void
  (e: 'close-floating'): void
}>()

const menuOpen = ref(false)

// Rule #11: BekasKu+ vs VIP
const isBekaskuPlus = computed(() =>
  Boolean(
    props.partner.is_bekasku_plus ||
      String(props.partner.name || '').toLowerCase() === 'anne14',
  ),
)

const isVip = computed(() =>
  !isBekaskuPlus.value && String(props.partner.subscribe_type || '').toLowerCase() === 'vip',
)

const isOnlineNow = computed(() => {
  const s = (props.statusText || '').toLowerCase()
  return props.isTyping || s === 'online' || s === 'on typing'
})

const displayStatus = computed(() => {
  if (props.isTyping || props.statusText === 'ON TYPING') {
    return 'Sedang mengetik...'
  }
  if ((props.statusText || '').toLowerCase() === 'online') {
    return 'Online'
  }
  return props.statusText || ''
})
</script>

<template>
  <div class="px-4 py-3 bg-white border-b border-border-light flex items-center justify-between gap-2 shrink-0 relative z-20">
    <!-- Left: Back Button + Partner Avatar & Info -->
    <div class="flex items-center gap-2.5 min-w-0">
      <button
        v-if="showBackButton"
        type="button"
        @click="emit('back')"
        class="p-1.5 -ml-1.5 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
        aria-label="Kembali"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>

      <NuxtLink
        v-if="partner.id"
        :to="`/seller/${partner.id}`"
        class="flex items-center gap-2.5 min-w-0 group"
      >
        <div class="w-9 h-9 rounded-full overflow-hidden bg-surface-2 border border-border-light flex items-center justify-center shrink-0">
          <img
            v-if="partner.avatar"
            :src="partner.avatar"
            :alt="partner.name"
            class="w-full h-full object-cover"
          />
          <UserIcon v-else class="w-4 h-4 text-text-subtle" />
        </div>

        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <!-- Rule #11: BekasKu+ Badge -->
            <img
              v-if="isBekaskuPlus"
              src="/images/bekasku_plus_variant_6_horizontal.png"
              alt="BekasKu+"
              class="h-3.5 w-auto object-contain shrink-0"
            />

            <!-- Rule #11: VIP Badge -->
            <span
              v-else-if="isVip"
              class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 font-outfit font-semibold text-[10px] shrink-0"
            >
              <Crown class="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              <span>VIP</span>
            </span>

            <span class="font-outfit font-bold text-sm text-text truncate max-w-[150px] sm:max-w-[200px] group-hover:text-primary transition-colors">
              {{ partner.name || 'Pengguna BekasKu' }}
            </span>

            <!-- Penjual Role Pill (Tokopedia style) -->
            <span class="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-outfit font-semibold text-[10px] leading-tight shrink-0">
              Penjual
            </span>
          </div>

          <div v-if="displayStatus" class="flex items-center gap-1.5 mt-0.5">
            <span
              v-if="isOnlineNow"
              class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
            ></span>
            <span
              class="font-outfit text-[11px] truncate"
              :class="isTyping ? 'text-primary font-medium' : 'text-text-muted'"
            >
              {{ displayStatus }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Right: 3-Dots Menu + Expand + Hide/Collapse (v) -->
    <div class="flex items-center gap-0.5 shrink-0">
      <!-- 3-Dots Dropdown Menu -->
      <div class="relative">
        <button
          type="button"
          @click="menuOpen = !menuOpen"
          class="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer"
          aria-label="Menu Opsi Chat"
        >
          <MoreVertical class="w-4 h-4" />
        </button>

        <div
          v-if="menuOpen"
          class="fixed inset-0 z-10"
          @click="menuOpen = false"
        ></div>

        <div
          v-if="menuOpen"
          class="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-border-light shadow-lg py-1.5 z-20"
        >
          <button
            type="button"
            @click="menuOpen = false; emit('open-security')"
            class="w-full px-3.5 py-2.5 text-left font-outfit text-xs sm:text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <ShieldAlert class="w-4 h-4 text-text-muted shrink-0" />
            <span>Panduan Keamanan</span>
          </button>

          <button
            v-if="!isBlocked"
            type="button"
            @click="menuOpen = false; emit('open-block')"
            class="w-full px-3.5 py-2.5 text-left font-outfit text-xs sm:text-sm text-danger hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Ban class="w-4 h-4 text-danger shrink-0" />
            <span>Blokir Pengguna</span>
          </button>
        </div>
      </div>

      <!-- Floating Controls: Expand Fullpage & Close/Minimize to Dock Pill -->
      <template v-if="isFloating">
        <button
          type="button"
          @click="emit('expand-fullpage')"
          class="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          title="Buka Halaman Chat Penuh"
          aria-label="Buka Halaman Chat Penuh"
        >
          <Maximize2 class="w-4 h-4" />
        </button>
        <button
          type="button"
          @click="emit('minimize-floating')"
          class="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          title="Perkecil ke Tombol Bawah"
          aria-label="Perkecil Chat ke Tombol Bawah"
        >
          <X class="w-4 h-4" />
        </button>
      </template>
    </div>
  </div>
</template>
