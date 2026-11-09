<script setup lang="ts">
import { onMounted } from 'vue'
import {
  Apple,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Mail,
  Phone,
} from 'lucide-vue-next'
import { APP_STORE_URL, PLAY_STORE_URL } from '~/utils/constants'
import { useFooterPartners } from '~/composables/useFooterPartners'
import { useHelpChatStore } from '~/stores/helpChat'
import { useLocale } from '~/composables/useLocale'

const { t } = useLocale()

const {
  paymentMethods,
  couriers,
  email,
  workingHour,
  formattedPhone,
  telHref,
  socialItems,
  loadFooterContact,
} = useFooterPartners()

const helpChatStore = useHelpChatStore()

function openBekaskuCenterChat() {
  helpChatStore.openHelpChat({ topic: 'general' })
}

onMounted(() => {
  loadFooterContact()
})

function onImgError(e: Event, fallbackText: string) {
  const target = e.target as HTMLImageElement
  if (target && !target.dataset.failed) {
    target.dataset.failed = 'true'
    target.classList.add('hidden')
    const parent = target.parentElement
    if (parent) {
      const span = document.createElement('span')
      span.className = 'text-[9px] font-bold text-text truncate max-w-full'
      span.innerText = fallbackText
      parent.appendChild(span)
    }
  }
}
</script>

<template>
  <footer class="w-full bg-surface-2 border-t border-border mt-4 sm:mt-6 text-xs text-text-muted font-outfit">
    <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-8 sm:py-10">
      <div class="grid grid-cols-2 md:grid-cols-12 lg:grid-cols-[1.05fr_1.05fr_1.6fr_1.6fr_2.2fr] gap-8 lg:gap-6">
        <!-- Col 1: Informasi (Static Quick Links) -->
        <div class="col-span-1 md:col-span-3 lg:col-span-1 space-y-2.5">
          <h4 class="font-bold text-text text-sm tracking-tight">
            {{ t('Informasi') }}
          </h4>
          <ul class="space-y-1.5 text-xs">
            <li>
              <NuxtLink to="/about" class="inline-flex min-h-[28px] items-center hover:text-primary-dark transition-colors">
                {{ t('Tentang Kami') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/safety-guide" class="inline-flex min-h-[28px] items-center hover:text-primary-dark transition-colors">
                {{ t('Panduan Keamanan') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/policy/terms" class="inline-flex min-h-[28px] items-center hover:text-primary-dark transition-colors">
                {{ t('Syarat & Ketentuan') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/policy/privacy" class="inline-flex min-h-[28px] items-center hover:text-primary-dark transition-colors">
                {{ t('Kebijakan Privasi') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 2: Bantuan -->
        <div class="col-span-1 md:col-span-3 lg:col-span-1 space-y-2.5">
          <h4 class="font-bold text-text text-sm tracking-tight">
            {{ t('Bantuan') }}
          </h4>
          <ul class="space-y-1.5 text-xs">
            <li>
              <NuxtLink to="/faq" class="inline-flex min-h-[28px] items-center hover:text-primary-dark transition-colors">
                {{ t('FAQ & Bantuan') }}
              </NuxtLink>
            </li>
            <li>
              <button
                type="button"
                class="inline-flex min-h-[28px] items-center hover:text-primary-dark transition-colors text-left cursor-pointer"
                @click="openBekaskuCenterChat"
              >
                {{ t('BekasKu Center') }}
              </button>
            </li>
            <li>
              <a
                href="https://blog.bekasku.id"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex min-h-[28px] items-center hover:text-primary-dark transition-colors"
              >
                {{ t('Blog BekasKu') }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Col 3: Metode Pembayaran -->
        <div class="col-span-2 md:col-span-6 lg:col-span-1 lg:order-3 md:order-4 space-y-3">
          <h4 class="font-bold text-text text-sm tracking-tight">
            {{ t('Metode Pembayaran') }}
          </h4>

          <div class="grid grid-cols-4 gap-1.5 sm:gap-2">
            <div
              v-for="pm in paymentMethods"
              :key="pm.code || pm.name"
              class="h-8 sm:h-9 bg-surface border border-border rounded-lg p-1.5 flex items-center justify-center shadow-2xs"
              :title="pm.name"
            >
              <img
                :src="pm.image"
                :alt="pm.name"
                class="max-h-full max-w-full object-contain"
                loading="lazy"
                @error="onImgError($event, pm.name)"
              />
            </div>
          </div>
        </div>

        <!-- Col 4: Jasa Pengiriman -->
        <div class="col-span-2 md:col-span-6 lg:col-span-1 lg:order-4 md:order-5 space-y-3">
          <h4 class="font-bold text-text text-sm tracking-tight">
            {{ t('Jasa Pengiriman') }}
          </h4>

          <div class="grid grid-cols-4 gap-1.5 sm:gap-2">
            <div
              v-for="courier in couriers"
              :key="courier.code || courier.name"
              class="h-8 sm:h-9 bg-surface border border-border rounded-lg p-1.5 flex items-center justify-center shadow-2xs"
              :title="courier.name"
            >
              <img
                :src="courier.image"
                :alt="courier.name"
                class="max-h-full max-w-full object-contain"
                loading="lazy"
                @error="onImgError($event, courier.name)"
              />
            </div>
          </div>
        </div>

        <!-- Col 5: Aplikasi & Kontak -->
        <div class="col-span-2 md:col-span-6 lg:col-span-1 lg:order-5 md:order-3 space-y-4">
          <div class="space-y-2.5">
            <h4 class="font-bold text-text text-sm tracking-tight">
              {{ t('Download Aplikasi') }}
            </h4>

            <div class="flex flex-wrap gap-2">
              <a
                :href="PLAY_STORE_URL"
                target="_blank"
                rel="noopener noreferrer"
                class="min-h-[40px] flex items-center gap-2 bg-text hover:bg-dark text-white px-3 py-1.5 rounded-lg border border-dark transition-colors"
              >
                <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186a2.04 2.04 0 01-.61-1.464V3.278c0-.57.228-1.097.61-1.464z" fill="currentColor" class="text-info" />
                  <path d="M17.186 8.607L13.793 12l3.393 3.393 3.844-2.187c.725-.413.725-1.085 0-1.498l-3.844-2.101z" fill="currentColor" class="text-secondary-star" />
                  <path d="M13.793 12L3.61 1.814c.348-.348.87-.456 1.348-.184l12.228 6.977-3.393 3.393z" fill="currentColor" class="text-success" />
                  <path d="M13.793 12l3.393 3.393L4.958 22.37c-.478.272-1 .164-1.348-.184L13.793 12z" fill="currentColor" class="text-primary-light" />
                </svg>
                <div class="flex flex-col text-left leading-none">
                  <span class="text-[8px] uppercase text-surface-2/80 font-medium tracking-wider">Google Play</span>
                  <span class="text-[11px] font-bold text-white mt-0.5">Android</span>
                </div>
              </a>

              <a
                :href="APP_STORE_URL"
                target="_blank"
                rel="noopener noreferrer"
                class="min-h-[40px] flex items-center gap-2 bg-text hover:bg-dark text-white px-3 py-1.5 rounded-lg border border-dark transition-colors"
              >
                <Apple class="w-4 h-4 fill-white text-white shrink-0" aria-hidden="true" />
                <div class="flex flex-col text-left leading-none">
                  <span class="text-[8px] uppercase text-surface-2/80 font-medium tracking-wider">App Store</span>
                  <span class="text-[11px] font-bold text-white mt-0.5">iOS</span>
                </div>
              </a>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <a
              v-for="social in socialItems"
              :key="social.key"
              :href="social.link"
              target="_blank"
              rel="noopener noreferrer"
              class="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-105 overflow-hidden"
              :class="social.badgeClass"
              :title="`${social.title}: ${social.description}`"
              :aria-label="`${social.title} ${social.description}`"
            >
              <Instagram v-if="social.kind === 'instagram'" class="w-4 h-4" aria-hidden="true" />
              <Facebook v-else-if="social.kind === 'facebook'" class="w-4 h-4 fill-current" aria-hidden="true" />
              <svg v-else-if="social.kind === 'twitter'" class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <svg v-else-if="social.kind === 'youtube'" class="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <svg v-else-if="social.kind === 'tiktok'" class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.32 0 .62.05.9.15v-3.55a6.38 6.38 0 0 0-.9-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.08a8.28 8.28 0 0 0 3.76.92V6.69z" />
              </svg>
              <Globe v-else class="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          <div class="pt-2 border-t border-border space-y-1.5 text-xs text-text-muted">
            <div class="flex items-center gap-2">
              <Phone class="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
              <a :href="telHref" class="hover:text-primary-dark font-medium transition-colors whitespace-nowrap">
                {{ formattedPhone }}
              </a>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              <Mail class="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
              <a :href="`mailto:${email}`" class="hover:text-primary-dark font-medium transition-colors whitespace-nowrap">
                {{ email }}
              </a>
            </div>
            <div class="flex items-start gap-2">
              <Clock class="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" aria-hidden="true" />
              <span>{{ workingHour }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Quick Links & Copyright Bar -->
      <div class="border-t border-border mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
        <p>&copy; 2026 <strong class="text-text font-semibold">PT Jantaka Ladang Unggul</strong></p>

        <nav aria-label="Tautan cepat footer" class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <NuxtLink to="/about" class="hover:text-primary-dark transition-colors">
            {{ t('Tentang Kami') }}
          </NuxtLink>
          <NuxtLink to="/safety-guide" class="hover:text-primary-dark transition-colors">
            {{ t('Panduan Keamanan') }}
          </NuxtLink>
          <NuxtLink to="/policy/terms" class="hover:text-primary-dark transition-colors">
            {{ t('Syarat & Ketentuan') }}
          </NuxtLink>
          <NuxtLink to="/policy/privacy" class="hover:text-primary-dark transition-colors">
            {{ t('Kebijakan Privasi') }}
          </NuxtLink>
          <NuxtLink to="/faq" class="hover:text-primary-dark transition-colors">
            FAQ
          </NuxtLink>
        </nav>
      </div>
    </div>
  </footer>
</template>
