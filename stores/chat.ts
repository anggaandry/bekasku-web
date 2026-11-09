import { defineStore } from 'pinia'
import {
  DEFAULT_API_BASE,
  API_CHAT_BOX,
  API_CHAT_LIST,
  API_CHAT_SEND,
  API_CHAT_LIVE_VIDEO,
  API_CHAT_ONLINE,
  API_USER_BLOCK,
  API_NEGOTIATE_PRODUCT_ACCEPT,
  API_NEGOTIATE_PRODUCT_DECLINE,
  API_NEGOTIATE_PRODUCT_UPDATE,
  TOKEN_WS,
  CHAT_FILTER_ALL,
  CHAT_STATUS_LOADING,
  CHAT_STATUS_FAIL,
  STORAGE_KEY_FAILED_CHAT_PREFIX,
} from '~/utils/constants'
import { sanitizeMediaUrl } from '~/utils/media'
import { mapChatMessage } from '~/utils/chatMapper'
import type {
  ChatBoxItem,
  ChatBoxResponse,
  ChatListResponse,
  ChatMessage,
  ChatOpenRoomOptions,
  ChatPartnerProfile,
  NegotiationChatModel,
  ProductChatModel,
  RequestChatModel,
  TransactionChatModel,
} from '~/types/chat'
import { useAuthStore } from '~/stores/auth'

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/

function generateClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const useChatStore = defineStore('chat', () => {
  const api = useApi()
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const { showNotification } = useNotification()

  // ── Chatbox (Room List) State ──────────────────────────────────────────
  const rooms = ref<ChatBoxItem[]>([])
  const filterType = ref<number>(CHAT_FILTER_ALL)
  const searchQuery = ref<string>('')
  const roomPage = ref<number>(1)
  const hasMoreRooms = ref<boolean>(false)
  const loadingRooms = ref<boolean>(false)
  const loadingMoreRooms = ref<boolean>(false)
  /** [totalUnread, unreadSeller, unreadBuyer] */
  const badges = ref<[number, number, number]>([0, 0, 0])

  // ── Active Room Conversation State ─────────────────────────────────────
  const activePartnerId = ref<string>('')
  const activePartnerProfile = ref<ChatPartnerProfile>({
    id: '',
    name: '',
    avatar: '',
  })
  const partnerStatus = ref<string>('')
  const isPartnerTyping = ref<boolean>(false)
  /** Messages stored newest-first (index 0 = newest), rendered bottom-up or reversed in UI */
  const messages = ref<ChatMessage[]>([])
  const messagePage = ref<number>(1)
  const hasMoreMessages = ref<boolean>(false)
  const loadingMessages = ref<boolean>(false)
  const loadingOlderMessages = ref<boolean>(false)
  const isBlocked = ref<boolean>(false)
  const actionLoading = ref<boolean>(false)

  // ── Draft & Context Attachment State ───────────────────────────────────
  const draftMessage = ref<string>('')
  const replyQuote = ref<string>('')
  const attachedProduct = ref<ProductChatModel | null>(null)
  const attachedTransaction = ref<TransactionChatModel | null>(null)
  const pendingLiveRequest = ref<RequestChatModel | null>(null)

  // ── Global Floating Chat Panel State ───────────────────────────────────
  const isFloatingOpen = ref<boolean>(false)
  const isFloatingMinimized = ref<boolean>(false)

  // ── WebSocket & Timers ─────────────────────────────────────────────────
  const wsConnected = ref<boolean>(false)
  let wsInstance: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let onlineCheckTimer: ReturnType<typeof setInterval> | null = null
  let pollFallbackTimer: ReturnType<typeof setInterval> | null = null
  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
  let myTypingTimer: ReturnType<typeof setTimeout> | null = null
  let partnerTypingTimer: ReturnType<typeof setTimeout> | null = null
  const roomTypingTimers = new Map<string, ReturnType<typeof setTimeout>>()
  let hasSentTyping = false

  const totalUnread = computed(() => badges.value[0] || 0)
  /** Chronological messages (oldest at top, newest at bottom) for natural web scroll */
  const chronologicalMessages = computed(() => [...messages.value].reverse())

  function resolveWsBaseUrl(): string {
    const apiBase = String(config.public.apiBase || DEFAULT_API_BASE).replace(/\/+$/, '')
    const wsProtocolBase = apiBase.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://')
    return `${wsProtocolBase}/socket`
  }

  // ── WebSocket Connection Management ────────────────────────────────────
  function connectWebSocket() {
    if (!import.meta.client || !authStore.isLoggedIn || !authStore.userId) return
    if (wsInstance && (wsInstance.readyState === WebSocket.OPEN || wsInstance.readyState === WebSocket.CONNECTING)) {
      return
    }

    try {
      const wsUrl = `${resolveWsBaseUrl()}/chat/${authStore.userId}?token=${encodeURIComponent(TOKEN_WS)}`
      wsInstance = new WebSocket(wsUrl)

      wsInstance.onopen = () => {
        wsConnected.value = true
        if (activePartnerId.value) {
          sendWsPayload({ command: 'check online', receiver: activePartnerId.value })
          sendWsPayload({ command: 'just open', receiver: activePartnerId.value })
        }
      }

      wsInstance.onmessage = (event) => {
        wsConnected.value = true
        try {
          const data = JSON.parse(String(event.data || '{}'))
          const msg = String(data.message || '')
          const sender = data.sender ? String(data.sender) : ''

          if (msg === 'new message' || msg.includes('JUST OPEN')) {
            fetchChatBox({ isRefresh: true, isSilent: true })
            if (activePartnerId.value) {
              fetchMessages({ resetPage: true, silent: true })
            }
          } else if (msg === 'ON TYPING' && sender) {
            toggleRoomTyping(sender, true)
            if (sender === activePartnerId.value) {
              isPartnerTyping.value = true
              partnerStatus.value = 'ON TYPING'
              if (partnerTypingTimer) clearTimeout(partnerTypingTimer)
              partnerTypingTimer = setTimeout(() => {
                isPartnerTyping.value = false
                fetchPartnerOnlineStatus()
              }, 4000)
            }
          } else if (msg === 'OFF TYPING' && sender) {
            toggleRoomTyping(sender, false)
            if (sender === activePartnerId.value) {
              if (partnerTypingTimer) clearTimeout(partnerTypingTimer)
              isPartnerTyping.value = false
              fetchPartnerOnlineStatus()
            }
          } else if (msg === 'RECEIVER ONLINE' || msg === 'RECEIVER OFFLINE') {
            if (activePartnerId.value) {
              fetchPartnerOnlineStatus()
            }
          }
        } catch {
          // ignore malformed WS frames
        }
      }

      wsInstance.onclose = () => {
        wsConnected.value = false
        scheduleReconnect()
      }

      wsInstance.onerror = () => {
        wsConnected.value = false
      }
    } catch {
      wsConnected.value = false
      scheduleReconnect()
    }
  }

  function scheduleReconnect() {
    if (!import.meta.client || !authStore.isLoggedIn) return
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => {
      connectWebSocket()
    }, 4000)
  }

  function sendWsPayload(payload: Record<string, unknown>) {
    if (!wsInstance || wsInstance.readyState !== WebSocket.OPEN) return
    try {
      wsInstance.send(JSON.stringify(payload))
    } catch {
      // ignore send errors
    }
  }

  function toggleRoomTyping(senderId: string, typing: boolean) {
    const idx = rooms.value.findIndex(r => String(r.id) === senderId)
    if (idx !== -1 && rooms.value[idx]) {
      rooms.value[idx].intyping = typing
    }
    const existing = roomTypingTimers.get(senderId)
    if (existing) clearTimeout(existing)
    if (typing) {
      roomTypingTimers.set(
        senderId,
        setTimeout(() => toggleRoomTyping(senderId, false), 4000),
      )
    } else {
      roomTypingTimers.delete(senderId)
    }
  }

  function notifyTyping() {
    if (!activePartnerId.value || !authStore.userId) return
    if (!wsConnected.value) connectWebSocket()
    if (!hasSentTyping) {
      hasSentTyping = true
      sendWsPayload({
        command: 'ON TYPING',
        receiver: activePartnerId.value,
        sender: authStore.userId,
      })
    }
    if (myTypingTimer) clearTimeout(myTypingTimer)
    myTypingTimer = setTimeout(() => {
      hasSentTyping = false
      sendWsPayload({
        command: 'OFF TYPING',
        receiver: activePartnerId.value,
        sender: authStore.userId,
      })
    }, 2200)
  }

  // ── Room List (ChatBox) Actions ────────────────────────────────────────
  async function fetchChatBox(options: { isRefresh?: boolean; isSilent?: boolean } = {}) {
    if (!authStore.isLoggedIn) {
      rooms.value = []
      badges.value = [0, 0, 0]
      return
    }

    if (options.isRefresh) {
      roomPage.value = 1
    }
    if (!options.isSilent && rooms.value.length === 0) {
      loadingRooms.value = true
    }

    try {
      const res = await api.post<ChatBoxResponse>(API_CHAT_BOX, {
        type: filterType.value,
        lang: 'id',
        page: roomPage.value,
        filter: searchQuery.value,
      })

      if (res?.status === true || (res?.message || '').toLowerCase() === 'success') {
        const data = res.result
        const urs = Number(data?.unread_seller || 0)
        const urb = Number(data?.unread_buyer || 0)
        badges.value = [urs + urb, urs, urb]

        const mappedDocs: ChatBoxItem[] = (data?.docs || []).map(item => ({
          ...item,
          id: String(item.id || ''),
          avatar: item.avatar ? sanitizeMediaUrl(item.avatar, '') : null,
          name: item.name || 'Pengguna BekasKu',
          is_bekasku_plus: Boolean(
            item.is_bekasku_plus ||
            String(item.name || '').toLowerCase() === 'anne14',
          ),
          intyping: false,
        }))

    if (options.isRefresh || roomPage.value === 1) {
          rooms.value = mappedDocs
        } else {
          rooms.value = [...rooms.value, ...mappedDocs]
        }
        hasMoreRooms.value = Boolean(data?.hasNextPage)

        // Ensure activePartnerProfile is always present in rooms list (e.g. new chat from product detail)
        if (activePartnerId.value) {
          const found = rooms.value.find(d => d.id === activePartnerId.value)
          if (found) {
            activePartnerProfile.value = {
              id: found.id,
              name: found.name || activePartnerProfile.value.name || 'Penjual',
              avatar: found.avatar || activePartnerProfile.value.avatar || '',
              subscribe_type: found.subscribe_type,
              is_bekasku_plus: found.is_bekasku_plus,
            }
          } else if (roomPage.value === 1 && !searchQuery.value) {
            rooms.value = [
              {
                id: activePartnerId.value,
                name: activePartnerProfile.value.name || 'Penjual',
                avatar: activePartnerProfile.value.avatar || null,
                time: 'Baru',
                message: 'Mulai percakapan',
                read: true,
                blocked: false,
                total_unread: 0,
                subscribe_type: activePartnerProfile.value.subscribe_type,
                is_bekasku_plus: activePartnerProfile.value.is_bekasku_plus,
                online: true,
                intyping: false,
              },
              ...rooms.value,
            ]
          }
        }
      }
    } catch {
      // silent catch
    } finally {
      loadingRooms.value = false
      loadingMoreRooms.value = false
    }
  }

  async function loadMoreRooms() {
    if (!hasMoreRooms.value || loadingMoreRooms.value) return
    loadingMoreRooms.value = true
    roomPage.value += 1
    await fetchChatBox({ isSilent: true })
  }

  function setFilterType(nextType: number) {
    if (filterType.value === nextType) return
    filterType.value = nextType
    roomPage.value = 1
    rooms.value = []
    fetchChatBox({ isRefresh: true })
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => {
      roomPage.value = 1
      fetchChatBox({ isRefresh: true, isSilent: true })
    }, 500)
  }

  function markPartnerRead(partnerId: string) {
    if (!partnerId) return
    const idx = rooms.value.findIndex(r => r.id === partnerId)
    if (idx !== -1 && rooms.value[idx]) {
      rooms.value[idx].total_unread = 0
      rooms.value[idx].read = true
    }
    fetchChatBox({ isRefresh: true, isSilent: true })
  }

  // ── Active Conversation Actions ────────────────────────────────────────
  async function fetchPartnerOnlineStatus() {
    if (!activePartnerId.value || !OBJECT_ID_REGEX.test(activePartnerId.value)) return
    try {
      const res = await api.post<{ message?: string; result?: string }>(API_CHAT_ONLINE, {
        object_id: activePartnerId.value,
        lang: 'id',
      })
      if ((res?.message || '').toLowerCase() === 'success' && res.result !== undefined) {
        if (!isPartnerTyping.value) {
          partnerStatus.value = String(res.result || '')
        }
      }
    } catch {
      // ignore
    }
  }

  function loadFailedMessagesFromStorage(partnerId: string): ChatMessage[] {
    if (!import.meta.client || !partnerId) return []
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_FAILED_CHAT_PREFIX}${partnerId}`)
      if (!raw) return []
      const list = JSON.parse(raw)
      if (!Array.isArray(list)) return []
      return list.reverse().map((item: Record<string, unknown>) => {
        const mapped = mapChatMessage(item)
        mapped.status = CHAT_STATUS_FAIL
        mapped.type = 0
        return mapped
      })
    } catch {
      return []
    }
  }

  function saveFailedMessageToStorage(partnerId: string, uploadData: Record<string, unknown>) {
    if (!import.meta.client || !partnerId) return
    try {
      const key = `${STORAGE_KEY_FAILED_CHAT_PREFIX}${partnerId}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      const list = Array.isArray(existing) ? existing : []
      list.push(uploadData)
      localStorage.setItem(key, JSON.stringify(list))
    } catch {
      // ignore
    }
  }

  function removeFailedMessageFromStorage(partnerId: string, generatedId: string) {
    if (!import.meta.client || !partnerId || !generatedId) return
    try {
      const key = `${STORAGE_KEY_FAILED_CHAT_PREFIX}${partnerId}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      if (!Array.isArray(existing)) return
      const filtered = existing.filter((item: Record<string, unknown>) => item.generated_id !== generatedId)
      if (filtered.length === 0) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(filtered))
      }
    } catch {
      // ignore
    }
  }

  async function fetchMessages(options: { resetPage?: boolean; silent?: boolean } = {}) {
    if (!authStore.isLoggedIn || !activePartnerId.value || !OBJECT_ID_REGEX.test(activePartnerId.value)) {
      return
    }

    if (options.resetPage) {
      messagePage.value = 1
    }
    if (!options.silent && messagePage.value === 1) {
      loadingMessages.value = true
    }

    try {
      const res = await api.post<ChatListResponse>(API_CHAT_LIST, {
        object_id: activePartnerId.value,
        page: messagePage.value,
        lang: 'id',
      })

      const isSuccess = res?.status === true || (res?.message || '').toLowerCase() === 'success'
      if (isSuccess && res.result) {
        const docs = (res.result.docs || []).map(d => mapChatMessage(d))

        if (messagePage.value === 1) {
          const failedLocal = loadFailedMessagesFromStorage(activePartnerId.value)
          messages.value = [...failedLocal, ...docs]
        } else {
          messages.value = [...messages.value, ...docs]
        }

        isBlocked.value = Boolean(res.result.blocked)
        hasMoreMessages.value = Boolean(res.result.hasNextPage)
        if (hasMoreMessages.value) {
          messagePage.value += 1
        }

        if (wsConnected.value && !options.silent) {
          sendWsPayload({ command: 'just open', receiver: activePartnerId.value })
        }
      }
    } catch {
      // ignore
    } finally {
      loadingMessages.value = false
      loadingOlderMessages.value = false
    }
  }

  async function loadOlderMessages() {
    if (loadingOlderMessages.value || !hasMoreMessages.value) return
    loadingOlderMessages.value = true
    await fetchMessages({ silent: true })
  }

  async function selectPartnerRoom(options: ChatOpenRoomOptions) {
    const partnerId = String(options.partnerId || '').trim()
    if (!partnerId || !OBJECT_ID_REGEX.test(partnerId)) return

    const isSamePartner = activePartnerId.value === partnerId
    activePartnerId.value = partnerId

    const existingRoom = rooms.value.find(r => r.id === partnerId)
    activePartnerProfile.value = {
      id: partnerId,
      name: options.partnerName || existingRoom?.name || activePartnerProfile.value.name || 'Penjual',
      avatar: sanitizeMediaUrl(options.partnerAvatar || existingRoom?.avatar || activePartnerProfile.value.avatar, ''),
      subscribe_type: options.subscribeType ?? existingRoom?.subscribe_type,
      is_bekasku_plus: options.isBekaskuPlus ?? existingRoom?.is_bekasku_plus,
      trusted: options.trusted,
    }

    // If partner is not yet in rooms list, prepend optimistic room entry so left sidebar shows it immediately (Tokopedia style)
    if (!existingRoom && !searchQuery.value) {
      rooms.value = [
        {
          id: partnerId,
          name: activePartnerProfile.value.name || 'Penjual',
          avatar: activePartnerProfile.value.avatar || null,
          time: 'Baru',
          message: 'Mulai percakapan',
          read: true,
          blocked: false,
          total_unread: 0,
          subscribe_type: activePartnerProfile.value.subscribe_type,
          is_bekasku_plus: activePartnerProfile.value.is_bekasku_plus,
          online: true,
          intyping: false,
        },
        ...rooms.value,
      ]
    }

    if (options.product !== undefined) {
      attachedProduct.value = options.product
    }
    if (options.transaction !== undefined) {
      attachedTransaction.value = options.transaction
    }
    if (options.initMessage) {
      draftMessage.value = options.initMessage
    }
    if (options.reply) {
      replyQuote.value = options.reply
    }

    connectWebSocket()
    markPartnerRead(partnerId)

    if (!isSamePartner) {
      messages.value = []
      partnerStatus.value = ''
      isPartnerTyping.value = false
    }

    await Promise.all([
      fetchMessages({ resetPage: true, silent: isSamePartner && messages.value.length > 0 }),
      fetchPartnerOnlineStatus(),
    ])

    // Start online status & fallback polling timers
    startRoomTimers()

    // If partnerprofile name is still generic, fetch seller info silently
    if (!options.partnerName && !existingRoom?.name) {
      fetchPartnerMetaSilently(partnerId)
    }

    // If a Live Photo / Live Video request was passed, send it immediately (matching mobile ChatController.onInit)
    if (options.request && options.request.id) {
      attachedProduct.value = null
      await sendLiveRequest({
        id: options.request.id,
        title: options.request.title,
        image: options.request.image,
        type: options.request.type === 'photo' ? 'photo' : 'video',
        price: options.request.price,
      })
    }
  }

  async function fetchPartnerMetaSilently(partnerId: string) {
    try {
      const res = await api.post<{ result?: Record<string, unknown> }>('/seller/info', {
        seller_id: partnerId,
      })
      if (res?.result && activePartnerId.value === partnerId) {
        activePartnerProfile.value = {
          id: partnerId,
          name: String(res.result.name || activePartnerProfile.value.name || 'Penjual'),
          avatar: sanitizeMediaUrl(res.result.avatar ? String(res.result.avatar) : activePartnerProfile.value.avatar, ''),
          is_bekasku_plus: Boolean(res.result.is_bekasku_plus),
          trusted: Boolean(res.result.trusted),
        }
      }
    } catch {
      // ignore
    }
  }

  function startRoomTimers() {
    stopRoomTimers()
    if (!import.meta.client) return
    onlineCheckTimer = setInterval(() => {
      if (activePartnerId.value) {
        fetchPartnerOnlineStatus()
        sendWsPayload({ command: 'check online', receiver: activePartnerId.value })
      }
    }, 10000)

    pollFallbackTimer = setInterval(() => {
      if (
        !wsConnected.value &&
        activePartnerId.value &&
        typeof document !== 'undefined' &&
        document.visibilityState === 'visible'
      ) {
        fetchMessages({ resetPage: true, silent: true })
        fetchChatBox({ isRefresh: true, isSilent: true })
      }
    }, 6000)
  }

  function stopRoomTimers() {
    if (onlineCheckTimer) {
      clearInterval(onlineCheckTimer)
      onlineCheckTimer = null
    }
    if (pollFallbackTimer) {
      clearInterval(pollFallbackTimer)
      pollFallbackTimer = null
    }
  }

  /**
   * Opens chat either in the Desktop Floating Chat Panel (Shopee/Tokopedia style)
   * or navigates to `/chat/[id]` on mobile screens / when `preferFullPage` is true.
   */
  async function openChatWith(options: ChatOpenRoomOptions) {
    const isDesktop = import.meta.client && window.innerWidth >= 768
    const currentPath = import.meta.client ? window.location.pathname : ''
    const isOnChatRoute = currentPath.startsWith('/chat')

    await selectPartnerRoom(options)

    if (isDesktop && !options.preferFullPage && !isOnChatRoute) {
      isFloatingOpen.value = true
      isFloatingMinimized.value = false
    } else {
      isFloatingOpen.value = false
      isFloatingMinimized.value = false
      await navigateTo(`/chat/${options.partnerId}`)
    }
  }

  function minimizeToFloatingIcon() {
    isFloatingOpen.value = false
    isFloatingMinimized.value = true
  }

  function dismissFloatingWidget() {
    isFloatingOpen.value = false
    isFloatingMinimized.value = false
  }

  // ── Send Message, Live Request, & Media Actions ────────────────────────
  async function sendMessage(params: {
    text?: string
    imageBase64?: string
    reqId?: string
    reqType?: string
  } = {}) {
    if (!activePartnerId.value || isBlocked.value) return
    const msgText = (params.text !== undefined ? params.text : draftMessage.value).trim()
    const imgBase64 = params.imageBase64 || ''
    const targetReqId = params.reqId || pendingLiveRequest.value?.id || ''
    const targetReqType = params.reqType || pendingLiveRequest.value?.type || ''

    if (
      !msgText &&
      !imgBase64 &&
      !targetReqId &&
      !attachedProduct.value &&
      !attachedTransaction.value
    ) {
      return
    }

    let optimisticRequest: RequestChatModel | null = null
    if (pendingLiveRequest.value) {
      optimisticRequest = { ...pendingLiveRequest.value }
    } else if (targetReqId) {
      const existingMsg = messages.value.find(
        m => (m.request_id === targetReqId || m.request?.id === targetReqId) && m.request,
      )
      if (existingMsg?.request) {
        optimisticRequest = { ...existingMsg.request }
      }
    }

    const generatedId = generateClientId()
    const currentProduct = attachedProduct.value ? { ...attachedProduct.value } : null
    const currentTransaction = attachedTransaction.value ? { ...attachedTransaction.value } : null
    const currentReply = replyQuote.value

    const optimisticChat: ChatMessage = {
      id: generatedId,
      to_id: activePartnerId.value,
      message: msgText,
      image: imgBase64,
      video: '',
      reply: currentReply,
      type: 0,
      status: CHAT_STATUS_LOADING,
      date: 'Hari ini',
      time: 'Baru saja',
      product_id: currentProduct?.id || '',
      product: currentProduct,
      transaction_id: currentTransaction?.id || '',
      transaction: currentTransaction,
      request_id: targetReqId,
      request: optimisticRequest,
    }

    // Optimistic insert at index 0 (newest)
    messages.value = [optimisticChat, ...messages.value]

    const effectiveProductId = currentProduct?.id || targetReqId || ''
    const uploadData: Record<string, unknown> = {
      generated_id: generatedId,
      to_id: activePartnerId.value,
      message: msgText,
      image: imgBase64,
      reply: currentReply,
      product_id: effectiveProductId,
      transaction_id: currentTransaction?.id || '',
      request_id: targetReqId,
    }

    if (currentProduct) {
      uploadData.product = currentProduct
    }
    if (currentTransaction) {
      uploadData.transaction = currentTransaction
    }
    if (targetReqId) {
      uploadData.request_type = targetReqType || optimisticRequest?.type || 'photo'
      if (optimisticRequest) {
        uploadData.request = optimisticRequest
      }
    }

    const partnerIdSnapshot = activePartnerId.value
    saveFailedMessageToStorage(partnerIdSnapshot, uploadData)

    // Clear draft & attachments
    if (params.text === undefined) {
      draftMessage.value = ''
    }
    replyQuote.value = ''
    attachedProduct.value = null
    attachedTransaction.value = null
    pendingLiveRequest.value = null

    await uploadChatPayload(partnerIdSnapshot, uploadData)
  }

  async function uploadChatPayload(partnerId: string, uploadData: Record<string, unknown>) {
    const genId = String(uploadData.generated_id || '')
    try {
      const res = await api.post<{ message?: string }>(API_CHAT_SEND, {
        data: [uploadData],
      })
      if ((res?.message || '').toLowerCase() === 'success') {
        removeFailedMessageFromStorage(partnerId, genId)
        sendWsPayload({
          command: 'send',
          message: String(uploadData.message || 'Pesan baru'),
          receiver: partnerId,
          sender: authStore.userId,
        })
        fetchChatBox({ isRefresh: true, isSilent: true })
        if (activePartnerId.value === partnerId) {
          await fetchMessages({ resetPage: true, silent: true })
        }
      } else {
        markMessageFailed(genId)
      }
    } catch {
      markMessageFailed(genId)
    }
  }

  function markMessageFailed(generatedId: string) {
    const idx = messages.value.findIndex(m => m.id === generatedId)
    if (idx !== -1 && messages.value[idx]) {
      messages.value[idx].status = CHAT_STATUS_FAIL
    }
  }

  async function retryFailedMessage(chat: ChatMessage) {
    if (!activePartnerId.value) return
    chat.status = CHAT_STATUS_LOADING
    const uploadData: Record<string, unknown> = {
      generated_id: chat.id,
      to_id: chat.to_id || activePartnerId.value,
      message: chat.message || '',
      image: chat.image || '',
      reply: chat.reply || '',
      product_id: chat.product_id || chat.request_id || '',
      transaction_id: chat.transaction_id || '',
      request_id: chat.request_id || '',
    }
    if (chat.product) uploadData.product = chat.product
    if (chat.transaction) uploadData.transaction = chat.transaction
    if (chat.request) {
      uploadData.request_type = chat.request.type
      uploadData.request = chat.request
    }
    await uploadChatPayload(activePartnerId.value, uploadData)
  }

  function deleteFailedMessage(chat: ChatMessage) {
    if (!activePartnerId.value) return
    removeFailedMessageFromStorage(activePartnerId.value, chat.id)
    messages.value = messages.value.filter(m => m.id !== chat.id)
  }

  async function sendLiveRequest(req: {
    id: string
    title: string
    image: string
    type: 'photo' | 'video'
    price?: number
  }) {
    attachedProduct.value = null
    pendingLiveRequest.value = {
      id: req.id,
      title: req.title,
      image: req.image,
      type: req.type,
      price: req.price,
      is_seller: false,
    }
    await sendMessage({
      text: '',
      reqId: req.id,
      reqType: req.type,
    })
  }

  async function sendVideoFile(params: {
    file: File
    caption?: string
    reqId?: string
  }): Promise<boolean> {
    if (!activePartnerId.value || isBlocked.value) return false
    actionLoading.value = true
    try {
      const formData = new FormData()
      formData.append('to_id', activePartnerId.value)
      formData.append('message', (params.caption || '').trim())
      formData.append('request_id', params.reqId || '')
      formData.append('video', params.file, params.file.name || 'video.mp4')

      const res = await api.post<{ status?: boolean | string; message?: string }>(
        API_CHAT_LIVE_VIDEO,
        formData,
      )
      const isSuccess =
        res?.status === true ||
        res?.status === 'success' ||
        (res?.message || '').toLowerCase() === 'success'

      if (isSuccess) {
        sendWsPayload({
          command: 'send',
          message: params.caption?.trim() || 'mengirim video..',
          receiver: activePartnerId.value,
          sender: authStore.userId,
        })
        await Promise.all([
          fetchMessages({ resetPage: true, silent: true }),
          fetchChatBox({ isRefresh: true, isSilent: true }),
        ])
        showNotification({ type: 'success', message: 'Video berhasil dikirim' })
        return true
      }
      showNotification({ type: 'error', message: res?.message || 'Gagal mengirim video' })
      return false
    } catch {
      showNotification({ type: 'error', message: 'Terjadi kesalahan saat mengunggah video' })
      return false
    } finally {
      actionLoading.value = false
    }
  }

  // ── Negotiation Actions inside Chat ────────────────────────────────────
  async function respondNegotiation(action: 'accept' | 'decline', nego: NegotiationChatModel): Promise<boolean> {
    if (!nego?.nego_id || !activePartnerId.value) return false
    actionLoading.value = true
    try {
      const endpoint = action === 'accept' ? API_NEGOTIATE_PRODUCT_ACCEPT : API_NEGOTIATE_PRODUCT_DECLINE
      const res = await api.post<{ message?: string; status?: boolean }>(endpoint, {
        id: nego.nego_id,
      })
      if (res?.status === true || (res?.message || '').toLowerCase() === 'success') {
        sendWsPayload({
          command: 'send',
          message: action === 'accept' ? 'Menerima tawaran harga' : 'Menolak tawaran harga',
          receiver: activePartnerId.value,
          sender: authStore.userId,
        })
        await Promise.all([
          fetchMessages({ resetPage: true, silent: true }),
          fetchChatBox({ isRefresh: true, isSilent: true }),
        ])
        showNotification({
          type: 'success',
          message: action === 'accept' ? 'Tawaran harga diterima' : 'Tawaran harga ditolak',
        })
        return true
      }
      showNotification({ type: 'error', message: res?.message || 'Gagal memproses penawaran' })
      return false
    } catch {
      showNotification({ type: 'error', message: 'Terjadi kesalahan jaringan' })
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function updateNegotiationOffer(params: {
    negoId: string
    productId: string
    newPrice: number
  }): Promise<boolean> {
    if (!params.negoId || !params.productId || params.newPrice <= 0) return false
    actionLoading.value = true
    try {
      const res = await api.post<{ status?: boolean; message?: string }>(API_NEGOTIATE_PRODUCT_UPDATE, {
        id: params.negoId,
        product_id: params.productId,
        price: params.newPrice,
        status: 0,
      })
      if (res?.status === true || (res?.message || '').toLowerCase() === 'success') {
        if (activePartnerId.value) {
          sendWsPayload({
            command: 'send',
            message: 'Menawarkan harga',
            receiver: activePartnerId.value,
            sender: authStore.userId,
          })
          await Promise.all([
            fetchMessages({ resetPage: true, silent: true }),
            fetchChatBox({ isRefresh: true, isSilent: true }),
          ])
        }
        showNotification({ type: 'success', message: 'Penawaran harga berhasil diperbarui' })
        return true
      }
      showNotification({ type: 'error', message: res?.message || 'Gagal memperbarui penawaran' })
      return false
    } catch {
      showNotification({ type: 'error', message: 'Terjadi kesalahan jaringan' })
      return false
    } finally {
      actionLoading.value = false
    }
  }

  // ── Block User Action ──────────────────────────────────────────────────
  async function blockPartner(reason: string): Promise<boolean> {
    if (!activePartnerId.value || !reason) return false
    actionLoading.value = true
    try {
      const res = await api.post<{ message?: string; result?: unknown }>(API_USER_BLOCK, {
        block_id: activePartnerId.value,
        id: activePartnerId.value,
        reason,
      })
      if ((res?.message || '').toLowerCase() === 'success' || res?.result !== undefined) {
        await fetchMessages({ resetPage: true, silent: true })
        showNotification({
          type: 'success',
          message: 'Pengguna berhasil diblokir. Anda tidak akan menerima atau mengirim pesan ke pengguna ini lagi.',
        })
        return true
      }
      showNotification({ type: 'error', message: res?.message || 'Gagal memblokir pengguna' })
      return false
    } catch {
      showNotification({ type: 'error', message: 'Terjadi kesalahan jaringan' })
      return false
    } finally {
      actionLoading.value = false
    }
  }

  function disconnectAll() {
    stopRoomTimers()
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (wsInstance) {
      try {
        wsInstance.close()
      } catch {
        // ignore
      }
      wsInstance = null
    }
    wsConnected.value = false
  }

  return {
    rooms,
    filterType,
    searchQuery,
    roomPage,
    hasMoreRooms,
    loadingRooms,
    loadingMoreRooms,
    badges,
    totalUnread,
    activePartnerId,
    activePartnerProfile,
    partnerStatus,
    isPartnerTyping,
    messages,
    chronologicalMessages,
    loadingMessages,
    loadingOlderMessages,
    hasMoreMessages,
    isBlocked,
    actionLoading,
    draftMessage,
    replyQuote,
    attachedProduct,
    attachedTransaction,
    pendingLiveRequest,
    isFloatingOpen,
    isFloatingMinimized,
    wsConnected,
    connectWebSocket,
    disconnectAll,
    notifyTyping,
    fetchChatBox,
    loadMoreRooms,
    setFilterType,
    setSearchQuery,
    markPartnerRead,
    selectPartnerRoom,
    openChatWith,
    minimizeToFloatingIcon,
    dismissFloatingWidget,
    fetchMessages,
    loadOlderMessages,
    sendMessage,
    retryFailedMessage,
    deleteFailedMessage,
    sendLiveRequest,
    sendVideoFile,
    respondNegotiation,
    updateNegotiationOffer,
    blockPartner,
  }
})

