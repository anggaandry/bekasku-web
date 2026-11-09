<template>
  <div class="min-h-screen bg-bg pb-20 md:pb-12">
    <main class="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white rounded-2xl p-5 border border-border shadow-2xs">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1.5 bg-primary text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Radio class="w-3 h-3 animate-pulse" />
              <span>Live Shopping</span>
            </span>
          </div>
          <h1 class="font-outfit font-black text-xl sm:text-2xl text-text">
            Siaran Langsung Penjual BekasKu
          </h1>
          <p class="text-xs sm:text-sm text-text-muted mt-1">
            Lihat detail kondisi barang bekas secara real-time, tanya jawab langsung dengan penjual, dan dapatkan penawaran terbaik.
          </p>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <NuxtLink
            to="/showcase/video"
            class="px-4 py-2.5 rounded-xl border border-border bg-surface-2 hover:bg-muted text-text font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
          >
            <PlaySquare class="w-4 h-4 text-primary" />
            <span>Video Feed</span>
          </NuxtLink>

          <button
            type="button"
            class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            @click="showDownloadModal = true"
          >
            <Plus class="w-4 h-4 stroke-[2.5]" />
            <span>Mulai Siaran Live</span>
          </button>
        </div>
      </div>

      <!-- Loading Skeletons -->
      <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        <div
          v-for="n in 5"
          :key="`live-page-skel-${n}`"
          class="aspect-[9/13.5] rounded-2xl bg-gray-200 animate-shimmer border border-border"
        />
      </div>

      <!-- Active Live Grid -->
      <div
        v-else-if="activeLives.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
      >
        <NuxtLink
          v-for="item in activeLives"
          :key="item.id"
          :to="`/live/${item.live_id || item.id}`"
          class="relative rounded-2xl overflow-hidden aspect-[9/13.5] shadow-md group cursor-pointer transition-all duration-300 hover:shadow-xl p-[2px] bg-gradient-to-tr from-[#FF2D20] via-[#FF7332] to-[#FF2D20] block"
        >
          <div class="relative w-full h-full rounded-[14px] overflow-hidden bg-gradient-to-br from-[#2B0A0D] via-black to-[#1E232C] flex flex-col justify-between">
            <img
              v-if="sanitizeMediaUrl(item.user_avatar || item.thumbnail, '')"
              :src="sanitizeMediaUrl(item.user_avatar || item.thumbnail, '')"
              :alt="item.user_name"
              class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

            <!-- Top Row -->
            <div class="relative z-10 p-2.5 flex items-center justify-between gap-1">
              <div class="flex items-center gap-1 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse">
                <span class="w-1.5 h-1.5 rounded-full bg-white" />
                <span>LIVE</span>
              </div>

              <div class="flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                <Eye class="w-3 h-3 text-white/90" />
                <span>{{ formatCompact(item.viewers || 0) }}</span>
              </div>
            </div>

            <!-- Bottom Host Info -->
            <div class="relative z-10 p-3 text-white">
              <div class="flex items-center gap-2">
                <div class="relative w-8 h-8 rounded-full ring-1.5 ring-white/90 overflow-hidden bg-gray-800 shadow-md shrink-0 flex items-center justify-center">
                  <img
                    v-if="sanitizeMediaUrl(item.user_avatar, '') && !avatarErrMap[item.id]"
                    :src="sanitizeMediaUrl(item.user_avatar, '')"
                    :alt="item.user_name"
                    class="w-full h-full object-cover"
                    @error="avatarErrMap[item.id] = true"
                  />
                  <span v-else class="text-xs font-bold text-white uppercase select-none">
                    {{ (item.user_name || 'H').charAt(0).toUpperCase() }}
                  </span>
                </div>

                <div class="min-w-0 flex-1">
                  <p class="font-outfit font-bold text-xs sm:text-sm text-white truncate drop-shadow-md">
                    {{ item.user_name }}
                  </p>
                  <p class="text-[11px] text-amber-300 font-medium truncate">
                    {{ item.title || 'Sesi Jualan Live' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="bg-white rounded-2xl border border-border p-10 flex flex-col items-center justify-center text-center shadow-2xs"
      >
        <div class="w-48 h-32 mb-4 flex items-center justify-center">
          <img
            src="/images/live_empty.svg"
            alt="Belum Ada Siaran Langsung"
            class="w-full h-full object-contain pointer-events-none"
          />
        </div>
        <h2 class="font-outfit font-bold text-lg text-text">
          Belum Ada Siaran Langsung Saat Ini
        </h2>
        <p class="text-xs sm:text-sm text-text-muted max-w-md mt-1.5 mb-6 leading-relaxed">
          Belum ada penjual yang sedang siaran langsung saat ini. Jelajahi Video Feed untuk melihat ulasan barang preloved atau mulai siaran melalui aplikasi mobile BekasKu.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <NuxtLink
            to="/showcase/video"
            class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center gap-2"
          >
            <PlaySquare class="w-4 h-4" />
            <span>Jelajahi Video Feed</span>
          </NuxtLink>

          <button
            type="button"
            class="px-5 py-2.5 rounded-xl border border-border bg-white hover:bg-surface-2 text-text font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            @click="showDownloadModal = true"
          >
            Mulai Live di Aplikasi
          </button>
        </div>
      </div>
    </main>

    <AppDownloadModal v-model="showDownloadModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Radio, Plus, Eye, PlaySquare } from 'lucide-vue-next'
import AppDownloadModal from '~/components/shared/AppDownloadModal.vue'
import { useLiveShopping } from '~/composables/useLiveShopping'
import { sanitizeMediaUrl } from '~/utils/media'

useHead({
  title: 'Sesi Siaran Langsung Penjual — BekasKu Live',
  link: [{ rel: 'canonical', href: 'https://bekasku.id/live' }],
  meta: [
    {
      name: 'description',
      content: 'Tonton siaran langsung penjual barang bekas berkualitas di BekasKu. Lihat kondisi fisik barang secara real-time, tanya jawab langsung, dan dapatkan penawaran terbaik.',
    },
    { name: 'robots', content: 'index, follow' },
  ],
})

const { fetchLiveSessions } = useLiveShopping()
const showDownloadModal = ref(false)
const avatarErrMap = reactive<Record<string, boolean>>({})

const { data: allFeed, pending } = await useAsyncData('live-directory-feed', () => fetchLiveSessions())

const activeLives = computed(() => {
  return (allFeed.value || []).filter((item) => item.is_live)
})

function formatCompact(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return num.toString()
}
</script>
