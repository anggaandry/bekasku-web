export type LivePlayerViewMode = 'fullscreen' | 'pip'

export interface LiveHostInitialData {
  id: string
  name: string
  avatar: string
  rating?: number
  title?: string
}

export function useLivePlayer() {
  const activeLiveId = useState<string | null>('live_player_active_id', () => null)
  const initialHost = useState<LiveHostInitialData | null>('live_player_initial_host', () => null)
  const viewMode = useState<LivePlayerViewMode>('live_player_view_mode', () => 'fullscreen')

  function openLive(liveId: string, hostData?: LiveHostInitialData) {
    if (!liveId) return
    if (activeLiveId.value === liveId) {
      viewMode.value = 'fullscreen'
      return
    }
    initialHost.value = hostData || null
    activeLiveId.value = liveId
    viewMode.value = 'fullscreen'
  }

  function minimizeToPip() {
    if (!activeLiveId.value) return
    viewMode.value = 'pip'
  }

  function expandToFullscreen() {
    if (!activeLiveId.value) return
    viewMode.value = 'fullscreen'
  }

  function closeLive() {
    activeLiveId.value = null
    initialHost.value = null
    viewMode.value = 'fullscreen'
  }

  return {
    activeLiveId,
    initialHost,
    viewMode,
    openLive,
    minimizeToPip,
    expandToFullscreen,
    closeLive,
  }
}
