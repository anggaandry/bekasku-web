<template>
  <div class="h-[100dvh] md:h-[calc(100vh-114px)] bg-[#0B0D10] flex items-center justify-center p-0 md:p-4 select-none overflow-hidden">
    <!-- Live Room Container -->
    <div
      class="relative w-full h-full md:max-w-[430px] md:max-h-[680px] bg-black md:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border-0 md:border md:border-white/10"
      @click="onViewportTap"
    >
      <!-- ── 1. LIVE VIDEO VIEWPORT (LiveKit WebRTC Track) ── -->
      <div class="absolute inset-0 flex items-center justify-center bg-black overflow-hidden pointer-events-auto">
        <video
          ref="videoElementRef"
          autoplay
          playsinline
          webkit-playsinline
          class="w-full h-full object-cover"
        />

        <!-- Waiting / Buffering Fallback Placeholder if track paused -->
        <div
          v-if="!isConnected"
          class="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center text-white"
        >
          <div class="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary/40 mb-4 animate-pulse flex items-center justify-center bg-gray-900">
            <img
              v-if="host.avatar && sanitizeMediaUrl(host.avatar, '') && !hostAvatarErr"
              :src="sanitizeMediaUrl(host.avatar, '')"
              :alt="host.name"
              class="w-full h-full object-cover"
              @error="hostAvatarErr = true"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gray-800 text-white font-bold text-xl select-none">
              {{ host.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <h4 class="font-outfit font-bold text-lg text-white mb-1">
            {{ host.name }}
          </h4>
          <p class="text-xs text-white/60 max-w-xs">
            Menyiapkan koneksi siaran langsung...
          </p>
        </div>
      </div>

      <!-- ── 2. GRADIENT OVERLAYS ── -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/85 pointer-events-none" />

      <!-- ── 3. FLOATING HEARTS ANIMATION OVERLAY ── -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden z-25">
        <TransitionGroup name="heart">
          <div
            v-for="h in floatingHearts"
            :key="h.id"
            class="absolute bottom-20 text-2xl heart-float"
            :style="{ left: `${h.left}%`, color: h.color }"
          >
            <Heart class="w-7 h-7 fill-current stroke-white/20" />
          </div>
        </TransitionGroup>
      </div>

      <!-- ── 4. TOP BAR (Host Pill + Audience Count + Close Button) ── -->
      <header class="relative z-30 pt-4 px-4 flex items-center justify-between pointer-events-none">
        <!-- Host Profile Pill (Matches mobile screenshot) -->
        <div class="pointer-events-auto flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 shadow-lg">
          <div class="w-8 h-8 rounded-full overflow-hidden ring-1.5 ring-white bg-gray-800 shrink-0 flex items-center justify-center">
            <img
              v-if="host.avatar && sanitizeMediaUrl(host.avatar, '') && !hostAvatarErr"
              :src="sanitizeMediaUrl(host.avatar, '')"
              :alt="host.name"
              class="w-full h-full object-cover"
              @error="hostAvatarErr = true"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-white text-xs font-bold select-none">
              {{ host.name.charAt(0).toUpperCase() }}
            </div>
          </div>

          <div class="min-w-0 pr-1">
            <p class="text-xs font-bold text-white truncate max-w-[100px] leading-tight">
              {{ host.name }}
            </p>
            <div class="flex items-center gap-1 text-[10px] text-amber-300 font-medium">
              <Star class="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
              <span>{{ host.rating.toFixed(1) }} Rating</span>
            </div>
          </div>
        </div>

        <!-- Right Side: Viewers Pill + Mute + Close Button -->
        <div class="pointer-events-auto flex items-center gap-2">
          <!-- Viewers Count Pill -->
          <div class="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 text-white text-xs font-semibold shadow-lg">
            <Users class="w-3.5 h-3.5 text-white/80" />
            <span>{{ viewers }}</span>
          </div>

          <!-- Audio Mute/Unmute Control -->
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-lg"
            :title="isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'"
            @click.stop="toggleMute"
          >
            <VolumeX v-if="isMuted" class="w-4 h-4 text-white/80" />
            <Volume2 v-else class="w-4 h-4 text-white" />
          </button>

          <!-- Red Close Button X (Matches mobile screenshot) -->
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-lg"
            title="Keluar dari Live"
            @click.stop="handleClose"
          >
            <X class="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </header>

      <!-- ── 5. BOTTOM OVERLAY: REAL-TIME CHAT & ACTIONS ── -->
      <footer class="relative z-30 p-4 pb-6 flex flex-col gap-3 pointer-events-none" @click.stop>
        <!-- Pinned Product Card (if active) -->
        <div
          v-if="pinnedProduct"
          class="pointer-events-auto flex items-center gap-3 p-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 text-white max-w-sm shadow-xl"
        >
          <div class="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 shrink-0">
            <img
              :src="sanitizeMediaUrl(pinnedProduct.image || (pinnedProduct as any).images?.[0], '')"
              :alt="pinnedProduct.title || (pinnedProduct as any).name"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
              Produk Disematkan
            </div>
            <p class="text-xs font-bold text-white truncate">{{ pinnedProduct.title || (pinnedProduct as any).name }}</p>
            <p class="text-xs font-extrabold text-white mt-0.5">
              Rp {{ formatRupiah(pinnedProduct.price) }}
            </p>
          </div>
          <NuxtLink
            :to="`/product/${pinnedProduct._id || (pinnedProduct as any).id}`"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-red-700 text-white font-bold text-xs shrink-0 shadow-md"
          >
            Beli
          </NuxtLink>
        </div>

        <!-- Chat Stream & Notifications -->
        <div
          ref="chatScrollRef"
          class="pointer-events-auto flex flex-col gap-1.5 max-h-44 overflow-y-auto no-scrollbar scroll-smooth pr-2"
        >
          <template v-for="msg in messages" :key="msg.id">
            <!-- User Join Toast (Matches mobile screenshot) -->
            <div
              v-if="msg.is_join"
              class="inline-flex items-center gap-1.5 text-xs text-white/90 drop-shadow-md py-0.5"
            >
              <Hand class="w-3.5 h-3.5 text-amber-300" />
              <span class="font-bold text-white">{{ msg.user_name }}</span>
              <span class="text-white/80">bergabung</span>
            </div>

            <!-- Standard Chat Message -->
            <div
              v-else
              class="inline-flex items-baseline gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-2xl max-w-[85%] self-start border border-white/5 text-xs"
            >
              <span class="font-bold text-amber-300 shrink-0">{{ msg.user_name }}:</span>
              <span class="text-white break-words leading-relaxed">{{ msg.message }}</span>
            </div>
          </template>
        </div>

        <!-- Bottom Action Row: Shopping Bag + Input + Heart -->
        <div class="pointer-events-auto flex items-center gap-2 pt-1">
          <!-- Shopping Bag Button with Badge (Matches mobile screenshot) -->
          <button
            type="button"
            class="relative w-10 h-10 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-black/70 active:scale-95 transition-all cursor-pointer shadow-md shrink-0"
            title="Buka Etalase Produk Live"
            @click="showProductDrawer = true"
          >
            <ShoppingBag class="w-5 h-5 text-red-400" />
            <span
              v-if="hostProducts.length > 0"
              class="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-black"
            >
              {{ hostProducts.length }}
            </span>
          </button>

          <!-- Chat Input Field -->
          <form class="flex-1 relative flex items-center" @submit.prevent="handleSendChat">
            <input
              v-model="chatInput"
              type="text"
              placeholder="Tulis..."
              maxlength="200"
              class="w-full pl-3.5 pr-10 py-2.5 text-xs bg-black/40 backdrop-blur-md rounded-full border border-white/15 focus:border-white focus:bg-black/60 focus:outline-hidden text-white placeholder:text-white/50 transition-all shadow-md"
            />
            <button
              type="submit"
              class="absolute right-1.5 w-7 h-7 rounded-full bg-primary hover:bg-red-700 text-white flex items-center justify-center transition-transform active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              :disabled="!chatInput.trim()"
            >
              <Send class="w-3.5 h-3.5 ml-0.5" />
            </button>
          </form>

          <!-- Heart / Like Floating Reaction Button -->
          <button
            type="button"
            class="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-red-500 hover:text-red-400 flex items-center justify-center transition-transform active:scale-125 cursor-pointer shadow-md shrink-0"
            title="Kirim Reaksi Love"
            @click="onLikeClick"
          >
            <Heart class="w-5 h-5 fill-red-500" />
          </button>
        </div>
      </footer>

      <!-- ── 6. GUEST GATE OVERLAY (Perlu Login sesuai Mobile V3) ── -->
      <div
        v-if="!authStore.isLoggedIn"
        class="absolute inset-0 z-40 bg-black/85 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center text-white"
        @click.stop
      >
        <div class="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/20 mb-4 flex items-center justify-center bg-gray-800">
          <img
            v-if="host.avatar && sanitizeMediaUrl(host.avatar, '') && !hostAvatarErr"
            :src="sanitizeMediaUrl(host.avatar, '')"
            :alt="host.name"
            class="w-full h-full object-cover"
            @error="hostAvatarErr = true"
          />
          <span v-else class="text-white font-bold text-2xl select-none">
            {{ host.name.charAt(0).toUpperCase() }}
          </span>
        </div>
        <h3 class="font-outfit font-bold text-lg text-white mb-1.5">
          Perlu Login
        </h3>
        <p class="text-xs text-white/70 max-w-xs mb-6 leading-relaxed">
          Silakan masuk ke akun Anda untuk menonton live streaming ini.
        </p>
        <button
          type="button"
          class="px-6 py-2.5 rounded-full bg-primary hover:bg-red-700 text-white font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
          @click="openLoginGate"
        >
          Masuk Sekarang
        </button>
      </div>

      <!-- ── 7. LIVE ENDED MODAL OVERLAY ── -->
      <div
        v-if="isLiveEnded"
        class="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white"
      >
        <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/50 mb-4">
          <Radio class="w-8 h-8" />
        </div>
        <h3 class="font-outfit font-black text-xl text-white mb-2">
          Siaran Langsung Telah Berakhir
        </h3>
        <p class="text-xs text-white/70 max-w-xs mb-6">
          Terima kasih telah menonton siaran bersama {{ host.name }}. Kunjungi toko untuk melihat produk lainnya.
        </p>
        <NuxtLink
          to="/showcase/video"
          class="px-6 py-3 rounded-full bg-primary hover:bg-red-700 text-white font-bold text-xs shadow-lg active:scale-95 transition-all text-center"
        >
          Kembali ke Video Feed
        </NuxtLink>
      </div>

      <!-- Live Products Drawer -->
      <LiveProductDrawer
        v-model="showProductDrawer"
        :products="hostProducts"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import {
  Heart,
  ShoppingBag,
  Users,
  X,
  Star,
  Send,
  Radio,
  Hand,
  Volume2,
  VolumeX,
} from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useLiveRoom } from '~/composables/useLiveRoom'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { sanitizeMediaUrl } from '~/utils/media'
import { formatNumber } from '~/utils/format'
import LiveProductDrawer from '~/components/live/LiveProductDrawer.vue'

const route = useRoute()
const liveId = String(route.params.id || '')

useHead({
  title: 'Siaran Langsung — BekasKu',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const authStore = useAuthStore()
const authModal = useAuthModal()
const hostAvatarErr = ref(false)

const {
  host,
  viewers,
  messages,
  pinnedProduct,
  hostProducts,
  floatingHearts,
  isLiveEnded,
  isConnected,
  isMuted,
  videoElementRef,
  joinRoom,
  sendChatMessage,
  sendLikeReaction,
  toggleMute,
  leaveRoom,
} = useLiveRoom(liveId)

const chatInput = ref('')
const showProductDrawer = ref(false)
const chatScrollRef = ref<HTMLDivElement | null>(null)

function getInitialHost() {
  return {
    id: String(route.query.seller_id || ''),
    name: String(route.query.seller_name || 'Host BekasKu'),
    avatar: String(route.query.seller_avatar || ''),
    rating: 4.8,
  }
}

function openLoginGate() {
  authModal.openLogin({
    featureTitle: 'Tonton Live Streaming',
    redirectPath: route.fullPath,
  })
}

onMounted(async () => {
  authStore.initFromStorage()
  if (authStore.isLoggedIn) {
    await joinRoom(getInitialHost())
  }
})

watch(
  () => authStore.isLoggedIn,
  async (loggedIn) => {
    if (loggedIn) {
      await joinRoom(getInitialHost())
    }
  }
)

watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    if (chatScrollRef.value) {
      chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
    }
  }
)

function handleClose() {
  leaveRoom()
  navigateTo('/showcase/video')
}

function onViewportTap() {
  sendLikeReaction()
}

function onLikeClick() {
  sendLikeReaction()
}

function handleSendChat() {
  if (!chatInput.value.trim()) return

  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Kirim Pesan Live',
      redirectPath: route.fullPath,
    })
    return
  }

  sendChatMessage(chatInput.value.trim())
  chatInput.value = ''
}

function formatRupiah(num: number): string {
  return formatNumber(num)
}
</script>

<style scoped>
@keyframes floatUp {
  0% {
    transform: translateY(0) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translateY(-240px) scale(1.4);
    opacity: 0;
  }
}

.heart-float {
  animation: floatUp 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
</style>

