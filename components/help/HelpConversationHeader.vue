<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrowLeft,
  CircleHelp,
  Maximize2,
  MoreVertical,
  ShieldAlert,
  X,
} from 'lucide-vue-next'

const props = defineProps<{
  statusText: string
  isTyping?: boolean
  wsConnected?: boolean
  showBackButton?: boolean
  isFloating?: boolean
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'open-security'): void
  (e: 'open-faq'): void
  (e: 'expand-fullpage'): void
  (e: 'minimize-floating'): void
  (e: 'close-floating'): void
}>()

const menuOpen = ref(false)

const isLiveReady = computed(() => Boolean(props.isTyping || props.wsConnected))

const displayStatus = computed(() => {
  if (props.isTyping || props.statusText === 'ON TYPING') {
    return 'Sedang mengetik...'
  }
  return props.statusText || (props.wsConnected ? 'Online' : 'Layanan Resmi')
})
</script>

<template>
  <div class="px-4 py-3 bg-white border-b border-border-light flex items-center justify-between gap-2 shrink-0 relative z-20 font-outfit">
    <!-- Left: Back Button (mobile) + Official BekasKu Center Avatar & Info -->
    <div class="flex items-center gap-2.5 min-w-0">
      <button
        v-if="props.showBackButton"
        type="button"
        class="min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] p-1.5 -ml-2 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-primary"
        aria-label="Kembali"
        @click="emit('back')"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>

      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-9 h-9 rounded-full overflow-hidden bg-primary/5 border border-border-light p-1 flex items-center justify-center shrink-0">
          <img
            src="/images/icon_only.png"
            alt="BekasKu Center"
            width="28"
            height="28"
            class="w-full h-full object-contain"
          />
        </div>

        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="font-outfit font-bold text-sm text-text truncate">
              BekasKu Center
            </span>
            <span class="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-outfit font-semibold text-[10px] leading-tight shrink-0">
              Official CS
            </span>
          </div>

          <div class="flex items-center gap-1.5 mt-0.5">
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :class="isLiveReady ? 'bg-emerald-500' : 'bg-text-muted'"
              aria-hidden="true"
            ></span>
            <span
              class="font-outfit text-[11px] truncate"
              :class="props.isTyping ? 'text-primary font-medium' : 'text-text-muted'"
            >
              {{ displayStatus }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: 3-Dots Menu + Expand Full Page + Minimize to Sticky Pill -->
    <div class="flex items-center gap-0.5 shrink-0">
      <div class="relative" @keydown.esc.stop="menuOpen = false">
        <button
          type="button"
          class="min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="Menu Opsi BekasKu Center"
          aria-haspopup="menu"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <MoreVertical class="w-4 h-4" aria-hidden="true" />
        </button>

        <div
          v-if="menuOpen"
          class="fixed inset-0 z-10"
          aria-hidden="true"
          @click="menuOpen = false"
        ></div>

        <div
          v-if="menuOpen"
          role="menu"
          aria-label="Opsi BekasKu Center"
          class="absolute right-0 mt-1.5 w-52 rounded-xl bg-white border border-border-light shadow-lg py-1.5 z-20"
        >
          <button
            type="button"
            role="menuitem"
            class="w-full min-h-[44px] md:min-h-[36px] px-3.5 py-2 text-left font-outfit text-xs sm:text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            @click="menuOpen = false; emit('open-faq')"
          >
            <CircleHelp class="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <span>Pusat Bantuan &amp; FAQ</span>
          </button>

          <button
            type="button"
            role="menuitem"
            class="w-full min-h-[44px] md:min-h-[36px] px-3.5 py-2 text-left font-outfit text-xs sm:text-sm text-text hover:bg-surface-2 flex items-center gap-2.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            @click="menuOpen = false; emit('open-security')"
          >
            <ShieldAlert class="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
            <span>Panduan Keamanan</span>
          </button>
        </div>
      </div>

      <template v-if="props.isFloating">
        <button
          type="button"
          class="min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-primary"
          title="Buka Halaman Penuh"
          aria-label="Buka Halaman Penuh BekasKu Center"
          @click="emit('expand-fullpage')"
        >
          <Maximize2 class="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-primary"
          title="Perkecil ke Tombol Bawah"
          aria-label="Perkecil BekasKu Center ke Tombol Bawah"
          @click="emit('minimize-floating')"
        >
          <X class="w-4 h-4" aria-hidden="true" />
        </button>
      </template>
    </div>
  </div>
</template>

