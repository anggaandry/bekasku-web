import tailwindcss from '@tailwindcss/vite'

// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },

  devServer: {
    port: 3050,
  },

  modules: [
    '@nuxt/image',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts',
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  css: [
    '~/assets/css/main.css',
  ],

  googleFonts: {
    families: {
      'Poppins': [400, 500, 600, 700],
    },
    display: 'swap',
    download: true,
    inject: true,
  },

  app: {
    head: {
      title: 'Bekasku — Jual Beli Barang Bekas & Preloved',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Bekasku — Marketplace jual beli barang bekas dan preloved terpercaya #1 di Indonesia.'
        },
        { name: 'theme-color', content: '#E31B23' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/icon_only.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      mode: process.env.NUXT_PUBLIC_MODE || 'coming_soon',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.bekasku.id',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=bkk.app.bekasku.bekasku',
      appStoreUrl: 'https://apps.apple.com/id/app/bekasku/id1609048207',
      launchDate: '2026-11-25T00:00:00+07:00',
    }
  }
})
