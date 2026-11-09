import { defineStore } from 'pinia'
import {
  DEFAULT_API_BASE,
  API_HELP_CHAT,
  API_HELP_SEND,
  TOKEN_WS,
  CHAT_STATUS_LOADING,
  CHAT_STATUS_FAIL,
  STORAGE_KEY_FAILED_HELP_CHAT,
  STORAGE_KEY_PENDING_HELP_POPUP,
} from '~/utils/constants'
import { mapChatMessage } from '~/utils/chatMapper'
import type { ChatMessage } from '~/types/chat'
import type { HelpCenterOpenOptions, HelpChatListResponse } from '~/types/help'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'

function generateHelpMessageId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `help-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function formatCurrentHHmm(): string {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

interface HelpOutgoingQueueItem extends Record<string, unknown> {
  message: string
  image: string
}

function sanitizeHelpText(raw: string): string {
  return String(raw || '').replace(/[<>]/g, '').trim()
}

function isSafeOutgoingPayload(item: Record<string, unknown>): boolean {
  const msg = String(item.message || '')
  const lower = msg.toLowerCase()
  if (lower.includes('<script') || lower.includes('javascript:')) return false
  if (msg.includes('<') || msg.includes('>')) return false
  const cleanMsg = msg.trim()
  const img = String(item.image || '').trim()
  return Boolean(cleanMsg || img)
}

export const useHelpChatStore = defineStore('helpChat', () => {
  const api = useApi()
  const authStore = useAuthStore()
  const authModal = useAuthModal()
  const config = useRuntimeConfig()
  const route = useRoute()

  // ── State ──────────────────────────────────────────────────────────────────
  const messages = ref<ChatMessage[]>([])
  const page = ref<number>(1)
  const hasMoreMessages = ref<boolean>(false)
  const loadingMessages = ref<boolean>(false)
  const loadingOlderMessages = ref<boolean>(false)
  const actionLoading = ref<boolean>(false)

  const adminStatus = ref<string>('Online')
  const isAdminTyping = ref<boolean>(false)
  const draftMessage = ref<string>('')
  const activeTopicContext = ref<HelpCenterOpenOptions | null>(null)

  // Persistent floating widget state (mirrors useChatStore popup UX)
  const isFloatingOpen = ref<boolean>(false)
  const isFloatingMinimized = ref<boolean>(false)

  // ── WebSocket & Timers ────────────────────────────────────────────────────
  const wsConnected = ref<boolean>(false)
  let wsInstance: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let onlineCheckTimer: ReturnType<typeof setInterval> | null = null
  let pollFallbackTimer: ReturnType<typeof setInterval> | null = null
  let myTypingTimer: ReturnType<typeof setTimeout> | null = null
  let adminTypingTimer: ReturnType<typeof setTimeout> | null = null
  let hasSentTyping = false
  let inFlightFetch: Promise<void> | null = null

  /** Chronological messages (oldest at top, newest at bottom) */
  const chronologicalMessages = computed(() => [...messages.value].reverse())

  function resolveWsBaseUrl(): string {
    const apiBase = String(config.public.apiBase || DEFAULT_API_BASE).replace(/\/+$/, '')
    const wsProtocolBase = apiBase.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://')
    return `${wsProtocolBase}/socket`
  }

  // ── WebSocket Connection (/socket/help/:userId?token=TOKEN_WS) ─────────────
  function connectWebSocket() {
    if (!import.meta.client || !authStore.isLoggedIn || !authStore.userId) return
    if (wsInstance && (wsInstance.readyState === WebSocket.OPEN || wsInstance.readyState === WebSocket.CONNECTING)) {
      return
    }

    try {
      const wsUrl = `${resolveWsBaseUrl()}/help/${authStore.userId}?token=${encodeURIComponent(TOKEN_WS)}`
      wsInstance = new WebSocket(wsUrl)

      wsInstance.onopen = () => {
        wsConnected.value = true
        sendWsPayload({ command: 'check online' })
        if (isFloatingOpen.value || route.path.startsWith('/help/chat')) {
          sendWsPayload({ command: 'just open' })
        }
        startTimers()
      }

      wsInstance.onmessage = (event) => {
        wsConnected.value = true
        try {
          const data = JSON.parse(String(event.data || '{}'))
          const msg = String(data.message || '')
          const sender = data.sender ? String(data.sender) : ''

          if (msg === 'new message' || msg === `JUST OPEN ${authStore.userId}`) {
            fetchMessages({ resetPage: true, silent: true })
          } else if (msg === 'ON TYPING' && sender === 'admin') {
            isAdminTyping.value = true
            adminStatus.value = 'Sedang mengetik...'
            if (adminTypingTimer) clearTimeout(adminTypingTimer)
            adminTypingTimer = setTimeout(() => {
              isAdminTyping.value = false
              adminStatus.value = 'Online'
            }, 4000)
          } else if (msg === 'OFF TYPING' && sender === 'admin') {
            if (adminTypingTimer) clearTimeout(adminTypingTimer)
            isAdminTyping.value = false
            adminStatus.value = 'Online'
          } else if (msg === 'RECEIVER ONLINE' || msg === 'RECEIVER OFFLINE') {
            if (!isAdminTyping.value) {
              adminStatus.value = 'Online'
            }
          }
        } catch {
          // ignore malformed frames
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
    if (!isFloatingOpen.value && !route.path.startsWith('/help/chat')) return
    reconnectTimer = setTimeout(() => {
      connectWebSocket()
    }, 4000)
  }

  function sendWsPayload(payload: Record<string, unknown>) {
    if (!wsInstance || wsInstance.readyState !== WebSocket.OPEN || !authStore.userId) return
    try {
      wsInstance.send(
        JSON.stringify({
          receiver: 'admin',
          sender: authStore.userId,
          ...payload,
        }),
      )
    } catch {
      // ignore send errors
    }
  }

  function notifyTyping() {
    if (!authStore.isLoggedIn || !authStore.userId) return
    if (!wsConnected.value) connectWebSocket()
    if (!hasSentTyping) {
      hasSentTyping = true
      sendWsPayload({ command: 'ON TYPING' })
    }
    if (myTypingTimer) clearTimeout(myTypingTimer)
    myTypingTimer = setTimeout(() => {
      hasSentTyping = false
      sendWsPayload({ command: 'OFF TYPING' })
    }, 2000)
  }

  function startTimers() {
    stopTimers()
    if (!import.meta.client) return

    onlineCheckTimer = setInterval(() => {
      if ((isFloatingOpen.value || route.path.startsWith('/help/chat')) && !isAdminTyping.value) {
        sendWsPayload({ command: 'check online' })
      }
    }, 10000)

    pollFallbackTimer = setInterval(() => {
      if (
        !wsConnected.value &&
        (isFloatingOpen.value || route.path.startsWith('/help/chat')) &&
        typeof document !== 'undefined' &&
        document.visibilityState === 'visible'
      ) {
        fetchMessages({ resetPage: true, silent: true })
      }
    }, 7000)
  }

  function stopTimers() {
    if (onlineCheckTimer) {
      clearInterval(onlineCheckTimer)
      onlineCheckTimer = null
    }
    if (pollFallbackTimer) {
      clearInterval(pollFallbackTimer)
      pollFallbackTimer = null
    }
  }

  // ── Failed Queue Persistence (_help_chat_failed matching mobile V3) ────────
  function readStoredFailedQueue(): Record<string, unknown>[] {
    if (!import.meta.client) return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FAILED_HELP_CHAT)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      const sanitized = parsed.filter((item): item is Record<string, unknown> =>
        Boolean(item && typeof item === 'object' && isSafeOutgoingPayload(item as Record<string, unknown>)),
      )
      if (sanitized.length !== parsed.length) {
        writeStoredFailedQueue(sanitized)
      }
      return sanitized
    } catch {
      return []
    }
  }

  function writeStoredFailedQueue(list: Record<string, unknown>[]) {
    if (!import.meta.client) return
    try {
      if (list.length === 0) {
        localStorage.removeItem(STORAGE_KEY_FAILED_HELP_CHAT)
      } else {
        localStorage.setItem(STORAGE_KEY_FAILED_HELP_CHAT, JSON.stringify(list))
      }
    } catch {
      // ignore storage errors
    }
  }

  function loadFailedMessagesForUi(): ChatMessage[] {
    const queue = readStoredFailedQueue()
    return queue.map((item) => {
      const mapped = mapChatMessage(item)
      mapped.status = CHAT_STATUS_FAIL
      mapped.type = 0
      return mapped
    })
  }

  // ── Messages Fetching & Pagination (POST /help/chat) ──────────────────────
  async function fetchMessages(options: { resetPage?: boolean; silent?: boolean } = {}) {
    if (!authStore.isLoggedIn) return
    if (inFlightFetch) {
      return inFlightFetch
    }

    inFlightFetch = (async () => {
      if (options.resetPage) {
        page.value = 1
      }
      if (!options.silent && page.value === 1 && messages.value.length === 0) {
        loadingMessages.value = true
      }

      try {
        const res = await api.post<HelpChatListResponse>(API_HELP_CHAT, {
          page: page.value,
          lang: 'id',
        })
        const isSuccess = res?.status === true || (res?.message || '').toLowerCase() === 'success'
        if (isSuccess && res.result) {
          const docs = (res.result.docs || []).map(d => mapChatMessage(d))
          if (page.value === 1) {
            const failedLocal = loadFailedMessagesForUi()
            messages.value = [...failedLocal, ...docs]
            if (wsConnected.value) {
              sendWsPayload({ command: 'just open' })
            }
          } else {
            const existingIds = new Set(messages.value.map(m => m.id).filter(Boolean))
            const uniqueOlder = docs.filter(d => !d.id || !existingIds.has(d.id))
            messages.value = [...messages.value, ...uniqueOlder]
          }

          hasMoreMessages.value = Boolean(res.result.hasNextPage)
          if (hasMoreMessages.value) {
            page.value += 1
          }
        }
      } catch {
        // silent catch; UI displays existing or retryable state
      } finally {
        loadingMessages.value = false
        loadingOlderMessages.value = false
        inFlightFetch = null
      }
    })()

    return inFlightFetch
  }

  async function loadOlderMessages() {
    if (loadingOlderMessages.value || !hasMoreMessages.value) return
    loadingOlderMessages.value = true
    await fetchMessages({ silent: true })
  }

  // ── Sending, Retry, Delete (POST /help/send matching mobile V3) ───────────
  async function uploadQueue(queue: Record<string, unknown>[]) {
    const cleanData: HelpOutgoingQueueItem[] = queue
      .filter(isSafeOutgoingPayload)
      .map((item): HelpOutgoingQueueItem => ({
        ...item,
        message: sanitizeHelpText(String(item.message || '')),
        image: String(item.image || '').trim(),
      }))
      .filter(item => Boolean(item.message || item.image))

    if (cleanData.length === 0) {
      writeStoredFailedQueue([])
      return
    }

    actionLoading.value = true
    try {
      const res = await api.post<{ message?: string }>(API_HELP_SEND, {
        data: cleanData,
      })
      if ((res?.message || '').toLowerCase() === 'success') {
        writeStoredFailedQueue([])
        hasSentTyping = false
        if (wsConnected.value && cleanData.length > 0) {
          const latestMsg = cleanData[0]?.message || 'Pesan bantuan baru'
          sendWsPayload({ command: 'send', message: latestMsg })
        }
        await fetchMessages({ resetPage: true, silent: true })
      } else {
        markLoadingAsFailed()
      }
    } catch {
      markLoadingAsFailed()
    } finally {
      actionLoading.value = false
    }
  }

  function markLoadingAsFailed() {
    messages.value = messages.value.map(msg =>
      msg.status === CHAT_STATUS_LOADING ? { ...msg, status: CHAT_STATUS_FAIL } : msg,
    )
  }

  async function sendMessage(params: { text?: string; imageBase64?: string } = {}) {
    if (!authStore.isLoggedIn) return
    const rawText = params.text !== undefined ? params.text : draftMessage.value
    const cleanText = sanitizeHelpText(rawText)
    const cleanImage = String(params.imageBase64 || '').trim()

    if (!cleanText && !cleanImage) return

    const id = generateHelpMessageId()
    const time = formatCurrentHHmm()

    const payloadItem: Record<string, unknown> = {
      id,
      image: cleanImage,
      message: cleanText,
      type: 0,
      time,
      date: 'Hari ini',
      status: CHAT_STATUS_LOADING,
    }

    const optimisticMsg = mapChatMessage(payloadItem)
    messages.value = [optimisticMsg, ...messages.value]

    if (params.text === undefined) {
      draftMessage.value = ''
    }
    if (myTypingTimer) clearTimeout(myTypingTimer)
    if (hasSentTyping) {
      hasSentTyping = false
      sendWsPayload({ command: 'OFF TYPING' })
    }

    const existingQueue = readStoredFailedQueue()
    const nextQueue = [payloadItem, ...existingQueue]
    writeStoredFailedQueue(nextQueue)

    await uploadQueue(nextQueue)
  }

  async function retryFailedMessage(chat: ChatMessage) {
    messages.value = messages.value.map(m =>
      m.id === chat.id ? { ...m, status: CHAT_STATUS_LOADING } : m,
    )

    const existingQueue = readStoredFailedQueue()
    const found = existingQueue.find(item => String(item.id || '') === chat.id)
    if (found) {
      await uploadQueue(existingQueue)
    } else {
      const rebuiltItem: Record<string, unknown> = {
        id: chat.id || generateHelpMessageId(),
        image: String(chat.image || '').replace(/^data:image\/[^;]+;base64,/, ''),
        message: sanitizeHelpText(chat.message || ''),
        type: 0,
        time: chat.time || formatCurrentHHmm(),
        date: chat.date || 'Hari ini',
        status: CHAT_STATUS_LOADING,
      }
      const nextQueue = [rebuiltItem, ...existingQueue]
      writeStoredFailedQueue(nextQueue)
      await uploadQueue(nextQueue)
    }
  }

  function deleteFailedMessage(chat: ChatMessage) {
    messages.value = messages.value.filter(m => m.id !== chat.id)
    const nextQueue = readStoredFailedQueue().filter(item => String(item.id || '') !== chat.id)
    writeStoredFailedQueue(nextQueue)
  }

  function savePendingHelpPopup(options: HelpCenterOpenOptions) {
    if (!import.meta.client) return
    try {
      sessionStorage.setItem(STORAGE_KEY_PENDING_HELP_POPUP, JSON.stringify(options || {}))
    } catch {
      // ignore storage errors
    }
  }

  function clearPendingHelpPopup() {
    if (!import.meta.client) return
    try {
      sessionStorage.removeItem(STORAGE_KEY_PENDING_HELP_POPUP)
    } catch {
      // ignore
    }
  }

  async function consumePendingHelpPopup(): Promise<boolean> {
    if (!import.meta.client || !authStore.isLoggedIn) return false
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_PENDING_HELP_POPUP)
      if (!raw) return false
      sessionStorage.removeItem(STORAGE_KEY_PENDING_HELP_POPUP)
      const parsed = JSON.parse(raw) as HelpCenterOpenOptions
      if (window.innerWidth >= 768 && !route.path.startsWith('/help/chat')) {
        return await openHelpChat(parsed || {})
      }
      return false
    } catch {
      clearPendingHelpPopup()
      return false
    }
  }

  // ── Popup, Minimize Sticky Pill, Close/Hide, Expand Fullpage Lifecycle ─────
  async function openHelpChat(options: HelpCenterOpenOptions = {}): Promise<boolean> {
    const isDesktop = import.meta.client && window.innerWidth >= 768
    const currentPath = import.meta.client ? window.location.pathname : route.path
    const currentFullPath = import.meta.client ? `${window.location.pathname}${window.location.search}` : route.fullPath
    const isOnFullPage = currentPath.startsWith('/help/chat')

    if (!authStore.isLoggedIn) {
      if (isDesktop && !options.preferFullPage && !isOnFullPage) {
        savePendingHelpPopup({
          topic: options.topic || 'general',
          referenceId: options.referenceId,
          referenceTitle: options.referenceTitle,
          initialMessage: options.initialMessage,
        })
        authModal.openLogin({
          featureTitle: 'BekasKu Center Live Chat',
          redirectPath: currentFullPath || '/',
        })
      } else {
        authModal.openLogin({
          featureTitle: 'BekasKu Center Live Chat',
          redirectPath: '/help/chat',
        })
      }
      return false
    }

    clearPendingHelpPopup()

    if (options.topic || options.referenceId || options.referenceTitle) {
      activeTopicContext.value = options
    }
    if (options.initialMessage && !draftMessage.value.trim()) {
      draftMessage.value = sanitizeHelpText(options.initialMessage)
    }

    if (isDesktop && !options.preferFullPage && !isOnFullPage) {
      isFloatingOpen.value = true
      isFloatingMinimized.value = false
    } else {
      isFloatingOpen.value = false
      isFloatingMinimized.value = false
      if (!isOnFullPage) {
        await navigateTo('/help/chat')
      }
    }

    connectWebSocket()
    await fetchMessages({ resetPage: true, silent: messages.value.length > 0 })
    return true
  }

  function minimizeToFloatingIcon() {
    isFloatingOpen.value = false
    isFloatingMinimized.value = true
  }

  function dismissFloatingWidget() {
    isFloatingOpen.value = false
    isFloatingMinimized.value = false
    stopTimers()
    if (wsInstance) {
      wsInstance.close()
      wsInstance = null
      wsConnected.value = false
    }
  }

  async function expandToFullPage() {
    isFloatingOpen.value = false
    isFloatingMinimized.value = false
    await navigateTo('/help/chat')
  }

  function clearTopicContext() {
    activeTopicContext.value = null
  }

  function disconnectAll() {
    clearPendingHelpPopup()
    isFloatingOpen.value = false
    isFloatingMinimized.value = false
    stopTimers()
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (myTypingTimer) clearTimeout(myTypingTimer)
    if (adminTypingTimer) clearTimeout(adminTypingTimer)
    if (wsInstance) {
      wsInstance.close()
      wsInstance = null
    }
    wsConnected.value = false
    isAdminTyping.value = false
    adminStatus.value = 'Online'
    messages.value = []
    page.value = 1
    hasMoreMessages.value = false
    draftMessage.value = ''
    activeTopicContext.value = null
  }

  return {
    messages,
    chronologicalMessages,
    page,
    hasMoreMessages,
    loadingMessages,
    loadingOlderMessages,
    actionLoading,
    adminStatus,
    isAdminTyping,
    draftMessage,
    activeTopicContext,
    isFloatingOpen,
    isFloatingMinimized,
    wsConnected,
    connectWebSocket,
    notifyTyping,
    fetchMessages,
    loadOlderMessages,
    sendMessage,
    retryFailedMessage,
    deleteFailedMessage,
    openHelpChat,
    consumePendingHelpPopup,
    clearPendingHelpPopup,
    minimizeToFloatingIcon,
    dismissFloatingWidget,
    expandToFullPage,
    clearTopicContext,
    disconnectAll,
  }
})
