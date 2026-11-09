<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Star, Package, User, ChevronRight, RefreshCw } from 'lucide-vue-next'
import { useNotificationStore } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { useFormat } from '~/composables/useFormat'
import { sanitizeMediaUrl } from '~/utils/media'
import type { NotificationWaitingReviewItem, NotificationMyReviewItem } from '~/types/notification'
import NotificationEmptyState from '~/components/notification/NotificationEmptyState.vue'

const emit = defineEmits<{
  (e: 'navigate', url: string): void
}>()

const notifStore = useNotificationStore()
const authStore = useAuthStore()
const { formatPrice, formatDate } = useFormat()

const activeTab = ref<'rating' | 'ulasan_saya'>('ulasan_saya')
const brokenImages = ref<Record<string, boolean>>({})

function markBroken(key: string) {
  brokenImages.value[key] = true
}

function getWaitingProductImage(item: NotificationWaitingReviewItem, idx: number): string {
  const key = `wait-${item.id || item._id || idx}`
  if (brokenImages.value[key]) return ''
  const raw = item.product_image || item.product_id?.[0]?.product_image
  return raw ? sanitizeMediaUrl(raw, '') : ''
}

function getMyReviewProductImage(rev: NotificationMyReviewItem, idx: number): string {
  const key = `rev-prod-${rev.id || rev._id || rev.transaction_id || idx}`
  if (brokenImages.value[key]) return ''
  const raw = rev.products?.[0]?.image || rev.product_image || rev.product_id?.[0]?.product_image
  return raw ? sanitizeMediaUrl(raw, '') : ''
}

function getReviewerAvatar(rev: NotificationMyReviewItem, idx: number): string {
  const key = `rev-ava-${rev.id || rev._id || rev.transaction_id || idx}`
  if (brokenImages.value[key]) return ''
  const raw = rev.avatar || rev.buyer_avatar || authStore.user?.avatar
  return raw ? sanitizeMediaUrl(raw, '') : ''
}

onMounted(() => {
  notifStore.fetchReviewNotifications()
})

function handleGoReview(transactionId?: string) {
  if (!transactionId) return
  emit('navigate', `/transaction?id=${transactionId}&open_review=true`)
}

function handleGoProduct(productId?: string) {
  if (productId) {
    emit('navigate', `/product/${productId}`)
  } else {
    emit('navigate', '/transaction')
  }
}
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0 bg-bg">
    <!-- Tab Bar (Rating vs Ulasan Saya) -->
    <div class="bg-white border-b border-border-light shrink-0" role="tablist">
      <div class="grid grid-cols-2 text-center">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'rating'"
          @click="activeTab = 'rating'"
          class="py-3 text-sm font-outfit font-semibold transition-colors relative cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          :class="activeTab === 'rating' ? 'text-primary' : 'text-text-muted hover:text-text'"
        >
          <span>Rating</span>
          <span
            v-if="activeTab === 'rating'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          />
        </button>

        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'ulasan_saya'"
          @click="activeTab = 'ulasan_saya'"
          class="py-3 text-sm font-outfit font-semibold transition-colors relative cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          :class="activeTab === 'ulasan_saya' ? 'text-primary' : 'text-text-muted hover:text-text'"
        >
          <span>Ulasan Saya</span>
          <span
            v-if="activeTab === 'ulasan_saya'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          />
        </button>
      </div>
    </div>

    <!-- Scrollable Content Area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <!-- Loading Skeleton -->
      <div v-if="notifStore.reviewLoading" class="space-y-3">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white rounded-2xl border border-border-light p-4 space-y-3 animate-pulse"
        >
          <div class="h-14 bg-surface-2 rounded-xl" />
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-surface-2" />
            <div class="space-y-1.5 flex-1">
              <div class="h-3.5 bg-surface-2 rounded w-1/3" />
              <div class="h-3 bg-surface-2 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="notifStore.reviewError" class="p-8 text-center space-y-3">
        <p class="font-outfit text-xs text-text-muted">
          {{ notifStore.reviewError }}
        </p>
        <button
          type="button"
          @click="notifStore.fetchReviewNotifications()"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-border-light hover:bg-surface-2 text-xs font-outfit font-semibold text-text transition-colors cursor-pointer"
        >
          <RefreshCw class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Coba lagi</span>
        </button>
      </div>

      <!-- Tab 1: Rating (Belum Diulas) -->
      <div v-else-if="activeTab === 'rating'" class="space-y-3">
        <NotificationEmptyState
          v-if="notifStore.waitingReviews.length === 0"
          title="Tidak ada produk yang perlu dinilai"
          subtitle="Semua transaksi pesanan Anda sudah diberikan ulasan."
        />

        <div
          v-for="(item, idx) in notifStore.waitingReviews"
          :key="item._id || item.id || idx"
          class="bg-white rounded-2xl border border-border-light p-4 space-y-3 shadow-2xs"
        >
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-xl overflow-hidden bg-surface-2 border border-border-light shrink-0 flex items-center justify-center">
              <img
                v-if="getWaitingProductImage(item, idx)"
                :src="getWaitingProductImage(item, idx)"
                :alt="item.product_name || item.product_id?.[0]?.product_title || 'Produk'"
                width="56"
                height="56"
                loading="lazy"
                class="w-full h-full object-cover"
                @error="markBroken(`wait-${item.id || item._id || idx}`)"
              />
              <Package v-else class="w-6 h-6 text-text-subtle" aria-hidden="true" />
            </div>

            <div class="flex-1 min-w-0">
              <h4 class="font-outfit font-semibold text-sm text-text truncate">
                {{ item.product_name || item.product_id?.[0]?.product_title || 'Produk Pesanan' }}
              </h4>
              <p class="font-outfit text-xs text-text-muted mt-0.5">
                {{ formatDate(item.transaction_time || item.createdAt) }}
              </p>
              <p class="font-outfit font-bold text-xs text-primary mt-1">
                {{ formatPrice(item.total_price || item.product_id?.[0]?.total_price || 0) }}
              </p>
            </div>
          </div>

          <div class="pt-2 border-t border-border-light flex items-center justify-end">
            <button
              type="button"
              @click="handleGoReview(item.id || item._id)"
              class="px-4 py-1.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-outfit font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Beri Ulasan
            </button>
          </div>
        </div>
      </div>

      <!-- Tab 2: Ulasan Saya -->
      <div v-else-if="activeTab === 'ulasan_saya'" class="space-y-3">
        <NotificationEmptyState
          v-if="notifStore.myReviews.length === 0"
          title="Belum ada ulasan"
          subtitle="Anda belum memberikan ulasan untuk produk yang dibeli."
        />

        <div
          v-for="(rev, idx) in notifStore.myReviews"
          :key="rev._id || rev.id || rev.transaction_id || idx"
          class="bg-white rounded-2xl border border-border-light p-4 space-y-3 shadow-2xs"
        >
          <!-- Product Row inside Review Card -->
          <button
            type="button"
            @click="handleGoProduct(rev.products?.[0]?.id || rev.product_id?.[0]?.product_id)"
            class="w-full flex items-center gap-3 p-2.5 rounded-xl bg-surface-2/60 border border-border-light hover:bg-surface-2 transition-colors cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-primary"
          >
            <div class="w-12 h-12 rounded-lg overflow-hidden bg-white border border-border-light shrink-0 flex items-center justify-center">
              <img
                v-if="getMyReviewProductImage(rev, idx)"
                :src="getMyReviewProductImage(rev, idx)"
                :alt="rev.products?.[0]?.title || rev.product_name || 'Produk'"
                width="48"
                height="48"
                loading="lazy"
                class="w-full h-full object-cover"
                @error="markBroken(`rev-prod-${rev.id || rev._id || rev.transaction_id || idx}`)"
              />
              <Package v-else class="w-5 h-5 text-text-subtle" aria-hidden="true" />
            </div>

            <div class="flex-1 min-w-0">
              <h4 class="font-outfit font-semibold text-xs sm:text-sm text-text truncate">
                {{ rev.products?.[0]?.title || rev.product_name || rev.product_id?.[0]?.product_title || 'Produk BekasKu' }}
              </h4>
              <p class="font-outfit font-bold text-xs text-primary mt-0.5">
                {{ formatPrice(rev.products?.[0]?.price || rev.total_price || rev.product_id?.[0]?.total_price || 0) }}
              </p>
            </div>

            <ChevronRight class="w-4 h-4 text-text-subtle shrink-0" aria-hidden="true" />
          </button>

          <!-- Reviewer Profile Row -->
          <div class="flex items-start gap-3 pt-1">
            <div class="w-9 h-9 rounded-full overflow-hidden bg-surface-2 border border-border-light shrink-0 flex items-center justify-center">
              <img
                v-if="getReviewerAvatar(rev, idx)"
                :src="getReviewerAvatar(rev, idx)"
                alt=""
                width="36"
                height="36"
                loading="lazy"
                class="w-full h-full object-cover"
                @error="markBroken(`rev-ava-${rev.id || rev._id || rev.transaction_id || idx}`)"
              />
              <User v-else class="w-4 h-4 text-text-subtle" aria-hidden="true" />
            </div>

            <div class="flex-1 min-w-0 space-y-1">
              <h5 class="font-outfit font-bold text-xs text-text truncate">
                {{ rev.name || rev.buyer_name || authStore.user?.name || authStore.user?.email || 'Saya' }}
              </h5>

              <div class="flex items-center gap-2 flex-wrap">
                <div class="flex items-center gap-0.5">
                  <Star
                    v-for="s in 5"
                    :key="s"
                    class="w-3.5 h-3.5"
                    :class="s <= (rev.score ?? rev.review_score ?? 5) ? 'text-secondary-star fill-secondary-star' : 'text-border'"
                    aria-hidden="true"
                  />
                </div>

                <span class="font-outfit text-[11px] text-text-subtle">
                  {{ rev.time || formatDate(rev.review_time || rev.createdAt) }}
                </span>
              </div>

              <div class="font-outfit text-[11px] text-text-muted flex items-center gap-3 flex-wrap">
                <span class="inline-flex items-center gap-0.5">
                  <span>Pelayanan: {{ rev.service_score ?? rev.review_service_score ?? 0 }}</span>
                  <Star class="w-3 h-3 text-secondary-star fill-secondary-star" aria-hidden="true" />
                </span>
                <span class="inline-flex items-center gap-0.5">
                  <span>Pengiriman: {{ rev.shipping_score ?? rev.review_shipping_score ?? 0 }}</span>
                  <Star class="w-3 h-3 text-secondary-star fill-secondary-star" aria-hidden="true" />
                </span>
              </div>

              <p
                v-if="rev.review || rev.review_text || rev.comment"
                class="font-outfit text-xs text-text leading-relaxed pt-1"
              >
                {{ rev.review || rev.review_text || rev.comment }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
