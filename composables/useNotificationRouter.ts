import type { NotificationItem } from '~/types/notification'

export function useNotificationRouter() {
  function navigateFromNotification(item: NotificationItem) {
    if (!import.meta.client) return

    const transId =
      item.transaction?.id ||
      item.transaction?._id ||
      item.transaction?.transaction_id ||
      item.transaction?.transactionId

    // 1. Direct explicit screen routing (if provided by backend)
    const screen = (item.screen || '').toLowerCase().trim()
    if (screen) {
      if (screen.includes('/balance/history') || screen.includes('/balance')) {
        navigateTo('/transaction?open_balance=true')
        return
      }
      if (screen.includes('/transaction/detail') || screen.includes('/transaction')) {
        if (transId) {
          navigateTo(`/transaction?id=${transId}`)
        } else {
          navigateTo('/transaction')
        }
        return
      }
      if (screen.includes('/chat')) {
        if (item.chat?.objectId || item.chat?.id) {
          navigateTo(`/chat/${item.chat.objectId || item.chat.id}`)
        } else {
          navigateTo('/chat')
        }
        return
      }
      if (screen.includes('/product/detail') || screen.includes('/product/list')) {
        if (item.transaction?.product_id) {
          navigateTo(`/product/${item.transaction.product_id}`)
        } else {
          navigateTo('/')
        }
        return
      }
      if (screen.includes('/subscribe')) {
        navigateTo('/subscribe')
        return
      }
    }

    // 2. Chat object routing
    if (item.chat?.objectId || item.chat?.id) {
      navigateTo(`/chat/${item.chat.objectId || item.chat.id}`)
      return
    }

    // 3. Fallback Smart Keyword Routing (matches notification_view.dart)
    const title = (item.title || '').toLowerCase()
    const desc = (item.description || '').toLowerCase()

    // Saldo / Withdraw
    if (
      title.includes('saldo') ||
      desc.includes('saldo') ||
      title.includes('penarikan') ||
      desc.includes('penarikan') ||
      title.includes('tarik dana') ||
      desc.includes('tarik dana')
    ) {
      navigateTo('/transaction?open_balance=true')
      return
    }

    // Transaksi / Pesanan
    if (
      item.transaction ||
      item.type === 1 ||
      title.includes('transaksi') ||
      desc.includes('transaksi') ||
      title.includes('pesanan') ||
      desc.includes('pesanan') ||
      title.includes('pembayaran') ||
      desc.includes('pembayaran') ||
      title.includes('pengiriman') ||
      desc.includes('pengiriman') ||
      title.includes('resi') ||
      desc.includes('resi')
    ) {
      if (transId) {
        navigateTo(`/transaction?id=${transId}`)
      } else {
        navigateTo('/transaction')
      }
      return
    }

    // Live & Video
    if (item.type === 4 || item.feed) {
      const liveId = item.feed?.live_id || item.feed?.liveId
      if (liveId) {
        navigateTo(`/live/${liveId}`)
        return
      }
      navigateTo('/feed')
      return
    }

    // Default Fallback
    if (item.type === 2) {
      navigateTo('/best-deal')
      return
    }

    if (item.transaction?.product_id) {
      navigateTo(`/product/${item.transaction.product_id}`)
      return
    }
  }

  return {
    navigateFromNotification,
  }
}

