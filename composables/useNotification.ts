export interface NotificationItem {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export function useNotification() {
  const notifications = useState<NotificationItem[]>('app_notifications', () => [])

  function showNotification(options: {
    type?: 'success' | 'error' | 'info' | 'warning'
    message: string
    duration?: number
  }) {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const item: NotificationItem = {
      id,
      type: options.type || 'info',
      message: options.message,
      duration: options.duration || 3000,
    }

    notifications.value.push(item)

    if (typeof window !== 'undefined' && item.duration && item.duration > 0) {
      setTimeout(() => {
        dismissNotification(id)
      }, item.duration)
    }

    return id
  }

  function dismissNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications,
    showNotification,
    dismissNotification,
  }
}

