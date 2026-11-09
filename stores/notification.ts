import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  API_NOTIFICATION_LIST,
  API_MYREVIEW_LIST,
  API_REVIEW_CREATE_INIT,
  NOTIF_TYPE_ALL,
  NOTIF_TYPE_ORDER,
  NOTIF_TYPE_PROMO,
} from '~/utils/constants'
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationWaitingReviewItem,
  NotificationMyReviewItem,
  NotificationReviewListResponse,
} from '~/types/notification'
import { useAuthStore } from '~/stores/auth'

export const useNotificationStore = defineStore('notification', () => {
  const api = useApi()
  const authStore = useAuthStore()

  // Hub state
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Category subview state
  const categoryLoading = ref(false)
  const loadingMore = ref(false)
  const categoryError = ref<string | null>(null)
  const hasMore = ref(false)
  const currentPage = ref(1)

  // Review subview state
  const reviewLoading = ref(false)
  const reviewError = ref<string | null>(null)
  const waitingReviews = ref<NotificationWaitingReviewItem[]>([])
  const myReviews = ref<NotificationMyReviewItem[]>([])

  // Sub-category badges & latest descriptions (matches notification_controller.dart)
  const unreadSistem = ref(0)
  const unreadPromo = ref(0)
  const unreadLive = ref(0)
  const unreadReview = ref(0)

  const latestSistem = ref('')
  const latestPromo = ref('')
  const latestLive = ref('')

  // Lists
  const listOrderNotif = ref<NotificationItem[]>([])
  const listCategoryNotif = ref<NotificationItem[]>([])

  const totalUnread = computed(() => {
    return unreadSistem.value + unreadPromo.value + unreadLive.value + unreadReview.value
  })

  /**
   * Fetches the main notification dashboard data (All, Promo, and Order)
   * matching mobile NotificationController.fetchAllAndCategorize().
   */
  async function fetchAllAndCategorize() {
    if (!authStore.isLoggedIn) return
    loading.value = true
    error.value = null
    try {
      const [allRes, promoRes, transRes] = await Promise.all([
        api.post<NotificationListResponse>(API_NOTIFICATION_LIST, {
          page: 1,
          type: NOTIF_TYPE_ALL,
          lang: 'id',
        }),
        api.post<NotificationListResponse>(API_NOTIFICATION_LIST, {
          page: 1,
          type: NOTIF_TYPE_PROMO,
          lang: 'id',
        }),
        api.post<NotificationListResponse>(API_NOTIFICATION_LIST, {
          page: 1,
          type: NOTIF_TYPE_ORDER,
          lang: 'id',
        }),
      ])

      let pCount = 0
      let lCount = 0
      let sCount = 0

      let fPromo = ''
      let fLive = ''
      let fSistem = ''

      // Process All (contains System/3, Live/4, etc.)
      const allDocs = allRes?.result?.docs || []
      for (const item of allDocs) {
        if (item.type === 3 && !fSistem) fSistem = item.description || ''
        if (item.type === 4 && !fLive) fLive = item.description || ''

        if (!item.read) {
          if (item.type === 3) sCount++
          if (item.type === 4) lCount++
        }
      }

      // Process Promo
      const promoDocs = promoRes?.result?.docs || []
      for (const item of promoDocs) {
        if (!fPromo) fPromo = item.description || ''
        if (!item.read) pCount++
      }

      // Process Order Status
      const transDocs = transRes?.result?.docs || []
      listOrderNotif.value = transDocs.filter(d => d.type === 1)

      latestPromo.value = fPromo
      latestLive.value = fLive
      latestSistem.value = fSistem

      unreadPromo.value = pCount
      unreadLive.value = lCount
      unreadSistem.value = sCount
    } catch {
      error.value = 'Gagal memuat daftar notifikasi.'
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetches paginated notification list for a specific category type (1, 2, 3, or 4).
   */
  async function fetchNotificationList(type: number, isRefresh = false) {
    if (!authStore.isLoggedIn) return
    if (isRefresh) {
      currentPage.value = 1
      categoryLoading.value = true
      categoryError.value = null
    } else {
      loadingMore.value = true
    }

    try {
      const res = await api.post<NotificationListResponse>(API_NOTIFICATION_LIST, {
        page: currentPage.value,
        type,
        lang: 'id',
      })

      const docs = res?.result?.docs || []
      if (isRefresh) {
        listCategoryNotif.value = docs
      } else {
        listCategoryNotif.value = [...listCategoryNotif.value, ...docs]
      }

      hasMore.value = Boolean(res?.result?.hasNextPage)
    } catch {
      if (isRefresh) {
        categoryError.value = 'Gagal memuat notifikasi kategori ini.'
      }
    } finally {
      categoryLoading.value = false
      loadingMore.value = false
    }
  }

  async function loadMoreCategoryNotif(type: number) {
    if (loadingMore.value || !hasMore.value) return
    currentPage.value += 1
    await fetchNotificationList(type, false)
  }

  /**
   * Fetches waiting reviews and my reviews for Ulasan subview.
   */
  async function fetchReviewNotifications() {
    if (!authStore.isLoggedIn) return
    reviewLoading.value = true
    reviewError.value = null
    try {
      const [waitingRes, myReviewRes] = await Promise.all([
        api.post<NotificationReviewListResponse<NotificationWaitingReviewItem>>(
          API_REVIEW_CREATE_INIT,
          {
            page: 1,
            type: 'unreview',
            lang: 'id',
          },
        ),
        api.post<NotificationReviewListResponse<NotificationMyReviewItem>>(
          API_MYREVIEW_LIST,
          {
            page: 1,
            type: 'reviewed',
            lang: 'id',
          },
        ),
      ])

      waitingReviews.value = waitingRes?.result?.docs || []
      myReviews.value = myReviewRes?.result?.docs || []
      unreadReview.value = waitingReviews.value.length
    } catch {
      reviewError.value = 'Gagal memuat daftar ulasan.'
    } finally {
      reviewLoading.value = false
    }
  }

  function markAsReadLocally(id: string) {
    const item = listCategoryNotif.value.find(d => d.id === id)
    if (item && !item.read) {
      item.read = true
    }
    const orderItem = listOrderNotif.value.find(d => d.id === id)
    if (orderItem && !orderItem.read) {
      orderItem.read = true
    }
  }

  return {
    loading,
    error,
    categoryLoading,
    loadingMore,
    categoryError,
    hasMore,
    currentPage,
    reviewLoading,
    reviewError,
    waitingReviews,
    myReviews,
    unreadSistem,
    unreadPromo,
    unreadLive,
    unreadReview,
    latestSistem,
    latestPromo,
    latestLive,
    listOrderNotif,
    listCategoryNotif,
    totalUnread,
    fetchAllAndCategorize,
    fetchNotificationList,
    loadMoreCategoryNotif,
    fetchReviewNotifications,
    markAsReadLocally,
  }
})
