/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAqh2JqvVcySAWr-gfBISRYpfo64MKnKW4',
  authDomain: 'bekasku-e1979.firebaseapp.com',
  projectId: 'bekasku-e1979',
  storageBucket: 'bekasku-e1979.appspot.com',
  messagingSenderId: '729945552103',
  appId: '1:729945552103:web:dcf1daa202eebc77169e42',
  measurementId: 'G-QEED7HX56F',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const notif = payload.notification || {}
  const data = payload.data || {}
  const title = notif.title || data.title || 'BekasKu'
  const options = {
    body: notif.body || data.body || 'Anda menerima notifikasi baru dari BekasKu.',
    icon: notif.icon || '/favicon.png',
    badge: '/favicon.png',
    image: notif.image || data.image || undefined,
    data: {
      url: data.web_link || payload.fcmOptions?.link || '/notification',
      ...data,
    },
  }

  self.registration.showNotification(title, options)
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification?.data?.url || '/notification'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus()
          if ('navigate' in client) {
            client.navigate(targetUrl)
          }
          return
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    }),
  )
})
