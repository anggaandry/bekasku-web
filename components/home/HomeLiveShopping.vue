<template>
  <div class="flex flex-col h-full justify-between">
    <!-- Video & Live Cards Container (4 Visible Cards side by side) -->
    <div
      v-if="feedVideos.length > 0 || loading"
      class="flex flex-col flex-1 justify-between"
    >
      <div
        ref="feedContainerRef"
        class="grid grid-cols-4 gap-1.5 sm:gap-2 flex-1 overflow-x-auto no-scrollbar scroll-smooth"
      >
        <!-- Shimmer Loading Skeletons matching Mobile V3 -->
        <template v-if="loading">
          <div
            v-for="n in 4"
            :key="`live-skel-${n}`"
            class="aspect-[9/13.5] sm:aspect-[9/13] rounded-2xl bg-gray-200 animate-shimmer border border-gray-100 shadow-2xs"
          />
        </template>

        <template v-else v-for="(item, idx) in visibleCards" :key="item.id">
        <!-- LIVE CARD: Gradient ring border + Full Avatar Background + Host Avatar Profile -->
        <div
          v-if="item.is_live"
          class="relative rounded-2xl overflow-hidden aspect-[9/13.5] sm:aspect-[9/13] shadow-md group cursor-pointer transition-all duration-300 hover:shadow-xl p-[2px] bg-gradient-to-tr from-[#FF2D20] via-[#FF7332] to-[#FF2D20]"
          @click="onCardClick(item)"
        >
          <div class="relative w-full h-full rounded-[14px] overflow-hidden bg-gradient-to-br from-[#2B0A0D] via-black to-[#1E232C] flex flex-col justify-between">
            <!-- Background Image Fill -->
            <img
              v-if="item.user_avatar || item.thumbnail"
              :src="item.user_avatar || item.thumbnail"
              :alt="item.user_name"
              class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            <!-- Dark Gradient Overlay for text contrast -->
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

            <!-- Top Row: LIVE Badge & Viewers -->
            <div class="relative z-10 p-1.5 sm:p-2 flex items-center justify-between gap-1">
              <div class="flex items-center gap-1 bg-primary text-white text-[8.5px] font-black px-1.5 py-0.5 rounded-full shadow-md animate-pulse">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span>LIVE</span>
              </div>

              <div class="flex items-center gap-0.5 bg-black/60 backdrop-blur-xs text-white text-[8.5px] font-semibold px-1.5 py-0.5 rounded-full border border-white/10">
                <Eye class="w-2.5 h-2.5 text-white/90" />
                <span>{{ formatCompact(item.viewers || 0) }}</span>
              </div>
            </div>

            <!-- Center Live Broadcast Beacon on Hover -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-9 h-9 rounded-full bg-black/50 backdrop-blur-xs border border-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Radio class="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <!-- Bottom Overlay: Host Circular Avatar Profile + Name + Sesi Jualan Live -->
            <div class="relative z-10 p-1.5 sm:p-2 text-white">
              <div class="flex items-center gap-1.5">
                <!-- Circular Host Avatar Profile with gold badge -->
                <div class="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full ring-1.5 ring-white/90 overflow-hidden bg-gray-800 shadow-md shrink-0 flex items-center justify-center">
                  <img
                    v-if="(item.user_avatar || item.thumbnail) && !avatarErrMap[item.id]"
                    :src="item.user_avatar || item.thumbnail"
                    :alt="item.user_name"
                    class="w-full h-full object-cover"
                    @error="avatarErrMap[item.id] = true"
                  />
                  <span v-else class="text-[10px] font-bold text-white uppercase select-none">
                    {{ (item.user_name || 'H').charAt(0).toUpperCase() }}
                  </span>
                  <div class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary flex items-center justify-center ring-1 ring-white text-white shadow-2xs">
                    <Check class="w-1.5 h-1.5 text-white stroke-[3.5]" />
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <p class="font-outfit font-black text-[10px] sm:text-[11px] text-white drop-shadow-md truncate">
                    {{ item.user_name }}
                  </p>
                  <p class="text-[8px] sm:text-[8.5px] text-amber-300 font-semibold drop-shadow-sm truncate">
                    Sesi Jualan Live
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-end mt-1 pt-1 border-t border-white/15 text-[8.5px] text-white/80">
                <span class="text-[#EF4444] font-bold bg-white/95 px-1.5 py-0.2 rounded-full text-[8px] shadow-xs">Tonton</span>
              </div>
            </div>
          </div>
        </div>

        <!-- VIDEO FEED CARD: Video Thumbnail + Right Side Interactions -->
        <div
          v-else
          class="relative rounded-2xl overflow-hidden bg-black aspect-[9/13.5] sm:aspect-[9/13] shadow-md group cursor-pointer transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-[#E31B23]/40 flex flex-col justify-between border border-gray-200/20"
          @click="openVideoModal(item)"
          @mouseenter="onCardMouseEnter(item)"
          @mouseleave="onCardMouseLeave(item)"
        >
          <!-- Hover-to-Play Video Element (Muted loop preview ala YouTube / Instagram) -->
          <video
            v-if="hoveredVideoId === item.id && item.video_url"
            :src="item.video_url"
            autoplay
            muted
            loop
            playsinline
            class="absolute inset-0 w-full h-full object-cover z-0"
          />

          <!-- Background Poster / Thumbnail (Visible when not playing preview) -->
          <img
            v-show="hoveredVideoId !== item.id"
            :src="item.thumbnail"
            :alt="item.title || item.content || 'Video BekasKu'"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          <!-- Dark Gradient Overlays for readable text -->
          <div class="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/90 pointer-events-none" />

          <!-- Top Row: VIDEO Badge -->
          <div class="relative z-10 p-2 sm:p-2.5 flex items-center justify-start">
            <div
              class="flex items-center gap-1 backdrop-blur-xs text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white/20 transition-colors"
              :class="hoveredVideoId === item.id ? 'bg-[#E31B23] text-white shadow-xs' : 'bg-black/60 text-white'"
            >
              <Play class="w-2 h-2 fill-white text-white" />
              <span>{{ hoveredVideoId === item.id ? 'MEMUTAR' : 'VIDEO' }}</span>
            </div>
          </div>

          <!-- Center Play Overlay Button on Hover (Hidden while preview is playing) -->
          <div
            v-if="hoveredVideoId !== item.id"
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div class="w-9 h-9 rounded-full bg-black/50 backdrop-blur-xs border border-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <Play class="w-4 h-4 fill-white text-white ml-0.5" />
            </div>
          </div>

          <!-- Right Side Floating Actions -->
          <div class="absolute right-1.5 bottom-12 sm:bottom-14 z-10 flex flex-col items-center gap-2" @click.stop>
            <!-- Host Avatar with Border -->
            <NuxtLink
              :to="`/seller/${item.user_id || item.id}`"
              class="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full ring-1.5 ring-white overflow-hidden bg-gray-800 shadow-md group/avatar flex items-center justify-center shrink-0"
              title="Kunjungi Profil"
            >
              <img
                v-if="item.user_avatar && !avatarErrMap[item.id]"
                :src="item.user_avatar"
                :alt="item.user_name"
                class="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform"
                @error="avatarErrMap[item.id] = true"
              />
              <span v-else class="text-[10px] font-bold text-white uppercase select-none">
                {{ (item.user_name || 'U').charAt(0).toUpperCase() }}
              </span>
            </NuxtLink>

            <!-- Like Action -->
            <button
              type="button"
              class="flex flex-col items-center text-white hover:text-red-400 transition-colors cursor-pointer"
              @click.stop="toggleLike(item)"
            >
              <Heart
                class="w-4 h-4 transition-transform active:scale-125"
                :class="getLikeState(item).liked ? 'fill-red-500 text-red-500' : 'text-white'"
              />
              <span class="text-[9px] font-bold text-white mt-0.5 shadow-xs">
                {{ formatCompact(getLikeState(item).count) }}
              </span>
            </button>

            <!-- Comment Action (Opens Instagram-Style Modal / Comments) -->
            <button
              type="button"
              class="flex flex-col items-center text-white hover:text-blue-300 transition-colors cursor-pointer"
              @click.stop="openVideoModal(item)"
            >
              <MessageCircle class="w-4 h-4 text-white" />
              <span class="text-[9px] font-bold text-white mt-0.5 shadow-xs">
                {{ formatCompact(item.comments || 0) }}
              </span>
            </button>

            <!-- Share Action -->
            <button
              type="button"
              class="flex flex-col items-center text-white hover:text-yellow-300 transition-colors cursor-pointer"
              @click.stop="shareVideo(item)"
            >
              <Share2 class="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          <!-- Bottom Info (Username, Content, Audio info) -->
          <div class="relative z-10 p-2 sm:p-2.5 pr-8 text-white">
            <p class="font-outfit font-extrabold text-[11px] sm:text-xs text-white drop-shadow-md truncate">
              @{{ item.user_name }}
            </p>

            <p class="text-[10px] text-white/90 line-clamp-1 sm:line-clamp-2 mt-0.5 font-normal leading-tight drop-shadow-sm">
              {{ item.content || item.title }}
            </p>

            <!-- Music/Sound Track Row -->
            <div class="flex items-center gap-1 mt-1 text-white/75 text-[9px]">
              <Music class="w-2.5 h-2.5 text-white/90 shrink-0" />
              <span class="truncate font-medium">
                {{ item.music || 'Original sound' }}
              </span>
            </div>
          </div>
        </div>
      </template>
      </div>

      <!-- Bottom Controls: Arrows on Bottom-Left, Lihat Semua Video on Bottom-Right -->
      <div class="flex items-center justify-between pt-2 pb-0.5 px-0.5">
        <!-- Bottom-Left: Panah Geser Video (Kiri & Kanan) -->
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            :disabled="currentIndex === 0 || feedVideos.length <= 4"
            title="Video sebelumnya"
            aria-label="Video sebelumnya"
            @click="scrollPrev"
          >
            <ChevronLeft class="w-4 h-4 stroke-[2.2]" />
          </button>

          <button
            type="button"
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            :disabled="currentIndex >= feedVideos.length - 4 || feedVideos.length <= 4"
            title="Video selanjutnya"
            aria-label="Video selanjutnya"
            @click="scrollNext"
          >
            <ChevronRight class="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        <!-- Bottom-Right: Tombol Lihat Semua Video -->
        <NuxtLink
          to="/showcase/video"
          class="text-xs font-bold text-primary hover:text-red-700 flex items-center gap-0.5 transition-colors group cursor-pointer"
        >
          <span>{{ t('Lihat Semua Video') }}</span>
          <ChevronRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </NuxtLink>
      </div>
    </div>

    <!-- Empty State Illustration Card -->
    <div
      v-else
      class="bg-white rounded-2xl border border-gray-100/90 p-5 flex flex-col items-center justify-center text-center shadow-2xs h-full min-h-[220px]"
    >
      <div class="w-40 sm:w-48 h-24 sm:h-28 mb-2 flex items-center justify-center">
        <img
          src="/images/live_empty.svg"
          alt="Belum Ada Siaran Langsung"
          class="w-full h-full object-contain pointer-events-none"
        />
      </div>
      <h4 class="font-outfit font-bold text-gray-900 text-sm sm:text-base">
        {{ t('Belum Ada Siaran Langsung') }}
      </h4>
      <p class="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
        {{ t('Saat ini belum ada penjual yang sedang live shopping atau posting video baru. Tetap pantau ya!') }}
      </p>
    </div>

    <!-- Interactive Video Player Modal (Instagram-Style 2-Column on Desktop) -->
    <Teleport to="body">
      <div
        v-if="activeModalVideo"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4"
        @click.self="closeVideoModal"
      >
        <div class="relative w-full max-w-sm md:max-w-4xl h-[90vh] md:h-[82vh] max-h-[760px] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/20">
          
          <!-- LEFT COLUMN: Video Player Stage -->
          <div class="relative h-[45%] shrink-0 md:flex-1 md:max-w-[480px] md:h-full bg-black flex items-center justify-center overflow-hidden">
            <!-- Video Element -->
            <video
              ref="modalVideoPlayerRef"
              :src="activeModalVideo.video_url"
              :poster="activeModalVideo.thumbnail"
              class="w-full h-full object-cover cursor-pointer"
              autoplay
              playsinline
              loop
              @click="togglePlayPause"
            />

            <!-- Gradient Overlays for mobile/video text -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none md:hidden" />

            <!-- Top Header on Mobile -->
            <div class="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between text-white md:hidden">
              <span class="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Video Feed
              </span>
              <button
                type="button"
                class="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
                @click.stop="closeVideoModal"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Center Play/Pause Indicator -->
            <div
              v-if="!isPlaying"
              class="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <div class="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-xl">
                <Play class="w-8 h-8 fill-white text-white ml-1" />
              </div>
            </div>

            <!-- Floating Controls on Video (Mute button - Mobile only) -->
            <div class="absolute bottom-4 right-4 z-10 md:hidden">
              <button
                type="button"
                class="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-black/70 cursor-pointer"
                @click="toggleMute"
              >
                <VolumeX v-if="isMuted" class="w-4 h-4 text-white" />
                <Volume2 v-else class="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <!-- RIGHT COLUMN: Instagram-Style Comment & Details Sidebar (Desktop) -->
          <div class="w-full flex-1 min-h-0 md:flex-none md:w-[380px] lg:w-[420px] bg-white flex flex-col justify-between text-gray-900 border-t md:border-t-0 md:border-l border-gray-100 shrink-0 md:h-full overflow-hidden">
            <!-- Header: Creator Profile + Close Button -->
            <div class="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20 bg-gray-100 shrink-0 flex items-center justify-center">
                  <img
                    v-if="activeModalVideo.user_avatar && !modalAvatarErr"
                    :src="activeModalVideo.user_avatar"
                    :alt="activeModalVideo.user_name"
                    class="w-full h-full object-cover"
                    @error="modalAvatarErr = true"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-200">
                    {{ (activeModalVideo.user_name || 'U').charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="min-w-0">
                  <NuxtLink
                    :to="`/seller/${activeModalVideo.user_id || activeModalVideo.id}`"
                    class="text-xs sm:text-sm font-bold text-gray-900 hover:text-primary transition-colors truncate block"
                  >
                    @{{ activeModalVideo.user_name }}
                  </NuxtLink>
                  <p class="text-[10px] text-gray-400">Seller BekasKu</p>
                </div>
              </div>

              <button
                type="button"
                class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                title="Tutup"
                @click="closeVideoModal"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Body: Caption, Pinned Product, Comments List (Scrollable) -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <!-- Caption Block -->
              <div class="text-xs text-gray-800 leading-relaxed">
                <span class="font-bold text-gray-900 mr-1.5">@{{ activeModalVideo.user_name }}</span>
                <span>{{ activeModalVideo.content || activeModalVideo.title }}</span>
              </div>

              <!-- Pinned Product Chip (if attached) -->
              <NuxtLink
                v-if="activeModalVideo.product || activeModalVideo.product_id"
                :to="`/product/${activeModalVideo.product?._id || activeModalVideo.product_id}`"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 hover:bg-red-50/50 border border-gray-200 transition-colors"
              >
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
                  <img
                    v-if="sanitizeMediaUrl(activeModalVideo.product?.image || activeModalVideo.thumbnail, '')"
                    :src="sanitizeMediaUrl(activeModalVideo.product?.image || activeModalVideo.thumbnail, '')"
                    :alt="activeModalVideo.product?.title || 'Produk Terkait'"
                    class="w-full h-full object-cover"
                  />
                  <ShoppingBag v-else class="w-4 h-4 text-gray-400" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold text-gray-900 truncate">{{ activeModalVideo.product?.title || 'Produk Terkait' }}</p>
                  <p class="text-[11px] font-black text-primary">Rp {{ formatRupiah(activeModalVideo.product?.price || 0) }}</p>
                </div>
                <span class="text-[10px] font-bold text-white bg-primary px-2 py-1 rounded-md shrink-0">
                  Lihat
                </span>
              </NuxtLink>

              <!-- Sound Track Row -->
              <div class="flex items-center gap-1.5 text-[11px] text-gray-400">
                <Music class="w-3 h-3 text-gray-400 shrink-0" />
                <span class="truncate">{{ activeModalVideo.music || 'Original video sound' }}</span>
              </div>

              <!-- Divider -->
              <div class="border-t border-gray-100 pt-2">
                <h5 class="text-xs font-bold text-gray-700 mb-3">
                  Komentar ({{ modalComments.length }})
                </h5>

                <!-- Comments List -->
                <div v-if="modalCommentsLoading" class="flex justify-center py-6">
                  <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>

                <div v-else-if="modalComments.length === 0" class="text-center py-8 text-gray-400 space-y-1">
                  <MessageSquare class="w-8 h-8 mx-auto text-gray-300 stroke-[1.5]" />
                  <p class="text-xs font-medium text-gray-500">Belum ada komentar</p>
                  <p class="text-[11px] text-gray-400">Jadilah yang pertama berkomentar!</p>
                </div>

                <div v-else class="space-y-3">
                  <div
                    v-for="c in modalComments"
                    :key="c._id"
                    class="flex items-start gap-2.5 text-xs"
                  >
                    <div class="w-7 h-7 rounded-full overflow-hidden bg-gray-100 shrink-0 ring-1 ring-gray-200">
                      <img
                        v-if="c.user_avatar && sanitizeMediaUrl(c.user_avatar, '')"
                        :src="sanitizeMediaUrl(c.user_avatar, '')"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center font-bold text-[10px] text-gray-500 bg-gray-200">
                        {{ c.user_name.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="font-bold text-gray-900">{{ c.user_name }}</span>
                        <span class="text-[10px] text-gray-400">{{ c.time || 'Baru saja' }}</span>
                      </div>
                      <p class="text-gray-700 mt-0.5 break-words">{{ c.comment }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer: Actions & Sticky Comment Input -->
            <div class="p-3 sm:p-4 border-t border-gray-100 bg-white shrink-0 space-y-2.5">
              <!-- Action Bar -->
              <div class="flex items-center justify-between text-gray-700">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    class="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer"
                    @click="toggleLike(activeModalVideo)"
                  >
                    <Heart
                      class="w-5 h-5"
                      :class="getLikeState(activeModalVideo).liked ? 'fill-red-500 text-red-500' : 'text-gray-700'"
                    />
                    <span class="text-xs font-bold">
                      {{ formatCompact(getLikeState(activeModalVideo).count) }}
                    </span>
                  </button>

                  <div class="flex items-center gap-1.5 text-gray-700">
                    <MessageCircle class="w-5 h-5 text-gray-700" />
                    <span class="text-xs font-bold">{{ modalComments.length }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    class="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                    title="Bisukan Audio"
                    @click="toggleMute"
                  >
                    <VolumeX v-if="isMuted" class="w-4 h-4" />
                    <Volume2 v-else class="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    class="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                    title="Bagikan"
                    @click="shareVideo(activeModalVideo)"
                  >
                    <Share2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Input Form -->
              <form class="flex items-center gap-2" @submit.prevent="submitModalComment">
                <input
                  v-model="modalCommentInput"
                  type="text"
                  placeholder="Tulis komentar..."
                  class="flex-1 px-3 py-2 text-xs bg-gray-100 rounded-full border border-transparent focus:border-primary focus:bg-white focus:outline-hidden transition-all text-gray-900 placeholder:text-gray-400"
                  :disabled="isSubmittingModalComment"
                />
                <button
                  type="submit"
                  class="w-8 h-8 rounded-full bg-primary hover:bg-red-700 text-white flex items-center justify-center transition-transform active:scale-90 disabled:opacity-40 cursor-pointer shrink-0 shadow-xs"
                  :disabled="!modalCommentInput.trim() || isSubmittingModalComment"
                >
                  <Send class="w-3.5 h-3.5 ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onBeforeUnmount } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  Radio,
  Play,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Music,
  X,
  Volume2,
  VolumeX,
  Check,
  Send,
  MessageSquare,
  ShoppingBag,
} from 'lucide-vue-next'
import { sanitizeMediaUrl } from '~/utils/media'
import { formatNumber } from '~/utils/format'
import type { VideoFeedItem, VideoCommentItem } from '~/types/video'
import { useLiveShopping } from '~/composables/useLiveShopping'
import { useVideoFeed } from '~/composables/useVideoFeed'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useNotification } from '~/composables/useNotification'

interface Props {
  sessions?: VideoFeedItem[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sessions: () => [],
  loading: false,
})

const { liveSessions, fetchLiveSessions } = useLiveShopping()
const { fetchComments, postComment, toggleLike: apiToggleLike } = useVideoFeed()
const authStore = useAuthStore()
const authModal = useAuthModal()
const { showNotification } = useNotification()
const { t } = useLocale()

// Avatar error tracking to fallback cleanly to initials instead of BekasKu logo
const avatarErrMap = reactive<Record<string, boolean>>({})
const modalAvatarErr = ref(false)

// Feed video list: prioritize props or composable, sanitize media URLs
const feedVideos = computed<VideoFeedItem[]>(() => {
  const rawList = (props.sessions && props.sessions.length > 0)
    ? props.sessions
    : liveSessions.value

  return rawList.map(item => ({
    ...item,
    thumbnail: sanitizeMediaUrl(item.thumbnail, ''),
    user_avatar: sanitizeMediaUrl(item.user_avatar, ''),
    video_url: sanitizeMediaUrl(item.video_url, ''),
  }))
})

onMounted(async () => {
  if (feedVideos.value.length === 0) {
    await fetchLiveSessions()
  }
})

onBeforeUnmount(() => {
  if (hoverTimer) {
    clearTimeout(hoverTimer)
    hoverTimer = null
  }
})

// Carousel Pagination Index
const currentIndex = ref(0)
const visibleCards = computed<VideoFeedItem[]>(() => {
  const list = feedVideos.value
  if (list.length === 0) return []
  return list.slice(currentIndex.value, currentIndex.value + 4)
})

function scrollPrev() {
  if (currentIndex.value > 0) {
    currentIndex.value = Math.max(0, currentIndex.value - 1)
  }
}

function scrollNext() {
  const maxIdx = Math.max(0, feedVideos.value.length - 4)
  if (currentIndex.value < maxIdx) {
    currentIndex.value = Math.min(maxIdx, currentIndex.value + 1)
  }
}

// Hover-to-Play Video Preview ala YouTube & Instagram
const hoveredVideoId = ref<string | null>(null)
let hoverTimer: ReturnType<typeof setTimeout> | null = null

function onCardMouseEnter(item: VideoFeedItem) {
  if (item.is_live || !item.video_url) return
  if (hoverTimer) clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => {
    hoveredVideoId.value = item.id
  }, 100)
}

function onCardMouseLeave(item: VideoFeedItem) {
  if (hoverTimer) {
    clearTimeout(hoverTimer)
    hoverTimer = null
  }
  if (hoveredVideoId.value === item.id) {
    hoveredVideoId.value = null
  }
}

interface LikeState {
  liked: boolean
  count: number
}

// Like state map (synced without double-counting)
const likeOverrides = reactive<Record<string, LikeState>>({})

function getLikeState(item: VideoFeedItem): LikeState {
  const override = likeOverrides[item.id]
  if (override) {
    return override
  }
  return {
    liked: item.is_liked === true,
    count: item.total_like ?? item.likes ?? 0,
  }
}

async function toggleLike(item: VideoFeedItem) {
  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Sukai Video',
      redirectPath: '/',
    })
    return
  }
  const current = getLikeState(item)
  const target: VideoFeedItem = {
    ...item,
    is_liked: current.liked,
    total_like: current.count,
    likes: current.count,
  }
  await apiToggleLike(target)
  likeOverrides[item.id] = {
    liked: target.is_liked === true,
    count: target.total_like ?? target.likes ?? current.count,
  }
}

function shareVideo(item: VideoFeedItem) {
  const videoId = encodeURIComponent(item._id || item.id)
  const shareUrl = `${window.location.origin}/showcase/video?id=${videoId}`
  if (navigator.share) {
    navigator.share({
      title: item.title || 'Video BekasKu',
      text: item.content || 'Lihat video ini di BekasKu!',
      url: shareUrl,
    }).catch(() => {})
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showNotification({
        type: 'success',
        message: 'Tautan video berhasil disalin.',
      })
    }).catch(() => {})
  }
}

// Modal Video Player & Comments State
const activeModalVideo = ref<VideoFeedItem | null>(null)
const modalVideoPlayerRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(true)
const isMuted = ref(false)

const modalComments = ref<VideoCommentItem[]>([])
const modalCommentsLoading = ref(false)
const modalCommentInput = ref('')
const isSubmittingModalComment = ref(false)

function onCardClick(item: VideoFeedItem) {
  if (item.is_live) {
    navigateTo(`/live/${item.live_id || item.id}`)
  } else {
    openVideoModal(item)
  }
}

async function openVideoModal(item: VideoFeedItem) {
  activeModalVideo.value = item
  isPlaying.value = true
  isMuted.value = false
  modalAvatarErr.value = false
  modalComments.value = []
  modalCommentInput.value = ''

  // Load comments
  const videoId = item._id || item.id
  if (videoId) {
    modalCommentsLoading.value = true
    try {
      const res = await fetchComments(videoId, 1)
      modalComments.value = res.comments
    } finally {
      modalCommentsLoading.value = false
    }
  }
}

function closeVideoModal() {
  if (modalVideoPlayerRef.value) {
    modalVideoPlayerRef.value.pause()
  }
  activeModalVideo.value = null
  modalComments.value = []
}

function togglePlayPause() {
  if (!modalVideoPlayerRef.value) return
  if (modalVideoPlayerRef.value.paused) {
    modalVideoPlayerRef.value.play()
    isPlaying.value = true
  } else {
    modalVideoPlayerRef.value.pause()
    isPlaying.value = false
  }
}

function toggleMute() {
  if (!modalVideoPlayerRef.value) return
  isMuted.value = !isMuted.value
  modalVideoPlayerRef.value.muted = isMuted.value
}

async function submitModalComment() {
  const text = modalCommentInput.value.trim()
  if (!text || isSubmittingModalComment.value || !activeModalVideo.value) return

  if (!authStore.isLoggedIn) {
    authModal.openLogin({
      featureTitle: 'Kirim Komentar Video',
      redirectPath: '/',
    })
    return
  }

  isSubmittingModalComment.value = true
  try {
    const videoId = activeModalVideo.value._id || activeModalVideo.value.id
    const created = await postComment(videoId, text)
    modalComments.value.unshift(created)
    if (activeModalVideo.value.total_comment !== undefined) {
      activeModalVideo.value.total_comment += 1
    }
    modalCommentInput.value = ''
  } catch (err: any) {
    showNotification({
      type: 'error',
      message: err?.message || 'Gagal mengirim komentar.',
    })
  } finally {
    isSubmittingModalComment.value = false
  }
}

function formatCompact(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return num.toString()
}

function formatRupiah(num: number): string {
  return formatNumber(num)
}
</script>
