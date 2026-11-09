export type NotificationDrawerSubView = 'hub' | 'sistem' | 'promo' | 'live' | 'pesanan' | 'ulasan'

export const useNotificationDrawer = () => {
  const isOpen = useState<boolean>('notification_drawer_open', () => false)
  const activeView = useState<NotificationDrawerSubView>('notification_drawer_view', () => 'hub')

  const open = (view: NotificationDrawerSubView = 'hub') => {
    activeView.value = view
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  const setView = (view: NotificationDrawerSubView) => {
    activeView.value = view
  }

  return {
    isOpen,
    activeView,
    open,
    close,
    toggle,
    setView,
  }
}

