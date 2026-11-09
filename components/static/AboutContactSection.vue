<script setup lang="ts">
import { computed } from 'vue'
import {
  Building2,
  ChevronRight,
  Clock,
  ExternalLink,
  Facebook,
  FileText,
  Globe,
  HelpCircle,
  Instagram,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-vue-next'
import { APP_STORE_URL, PLAY_STORE_URL } from '~/utils/constants'
import {
  formatPhoneDisplay,
  formatPhoneHref,
  formatSocialItems,
} from '~/composables/useLegalPolicy'
import { useLocale } from '~/composables/useLocale'
import type { AboutCompanyInfo } from '~/types/legal'

const props = defineProps<{
  company: AboutCompanyInfo
}>()

const { t } = useLocale()

const formattedPhoneDisplay = computed(() => formatPhoneDisplay(props.company.phone))
const telHref = computed(() => formatPhoneHref(props.company.phone))
const socialItems = computed(() => formatSocialItems(props.company.socmed))
</script>

<template>
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-outfit">
    <!-- Left Column: Official Contact & Office Location -->
    <div class="lg:col-span-7 bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
      <div class="space-y-0.5">
        <h2 class="text-base sm:text-lg font-bold text-text">
          {{ t('Kantor & Kontak Resmi') }}
        </h2>
        <p class="text-xs text-text-muted">
          {{ props.company.legalName }}
        </p>
      </div>

      <div class="divide-y divide-border">
        <div class="py-3.5 first:pt-0 flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0 text-primary-dark">
            <Building2 class="w-5 h-5" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1 space-y-1">
            <p class="text-xs font-semibold text-text-muted">{{ t('Kantor Pusat') }}</p>
            <p class="text-sm font-medium text-text leading-relaxed">
              {{ props.company.address }}
            </p>
            <a
              :href="props.company.mapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="min-h-[44px] inline-flex items-center gap-1 text-xs font-semibold text-primary-dark hover:underline"
            >
              <span>{{ t('Buka Google Maps') }}</span>
              <ExternalLink class="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div class="py-3.5 flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0 text-primary-dark">
            <Phone class="w-5 h-5" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1 space-y-0.5">
            <p class="text-xs font-semibold text-text-muted">{{ t('Telepon / WhatsApp') }}</p>
            <a
              v-if="telHref"
              :href="telHref"
              class="inline-flex min-h-[44px] items-center text-sm font-bold text-text hover:text-primary-dark transition-colors"
            >
              {{ formattedPhoneDisplay }}
            </a>
            <p v-else class="text-sm font-bold text-text">
              {{ formattedPhoneDisplay }}
            </p>
          </div>
        </div>

        <div class="py-3.5 flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0 text-primary-dark">
            <Mail class="w-5 h-5" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1 space-y-0.5">
            <p class="text-xs font-semibold text-text-muted">Email</p>
            <a
              :href="`mailto:${props.company.email}`"
              class="inline-flex min-h-[44px] items-center text-sm font-bold text-primary-dark hover:underline break-all"
            >
              {{ props.company.email }}
            </a>
          </div>
        </div>

        <div class="py-3.5 last:pb-0 flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0 text-primary-dark">
            <Clock class="w-5 h-5" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1 space-y-0.5">
            <p class="text-xs font-semibold text-text-muted">{{ t('Jam Layanan') }}</p>
            <p class="text-sm font-medium text-text">
              {{ props.company.working_hour }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Social Channels, Legal Docs & Store Links -->
    <div class="lg:col-span-5 space-y-5">
      <div class="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-2xs">
        <h2 class="text-base font-bold text-text">
          {{ t('Sosial Media Resmi') }}
        </h2>

        <div v-if="socialItems.length > 0" class="space-y-2">
          <a
            v-for="social in socialItems"
            :key="social.key"
            :href="social.link"
            target="_blank"
            rel="noopener noreferrer"
            class="min-h-[46px] flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-border hover:border-primary/40 hover:bg-surface-2 transition-colors group"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                :class="social.badgeClass"
              >
                <Instagram v-if="social.kind === 'instagram'" class="w-4 h-4" aria-hidden="true" />
                <Facebook v-else-if="social.kind === 'facebook'" class="w-4 h-4" aria-hidden="true" />
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
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-text capitalize truncate">{{ social.title }}</p>
                <p class="text-xs text-text-muted truncate">{{ social.description }}</p>
              </div>
            </div>
            <ExternalLink class="w-4 h-4 text-text-muted group-hover:text-primary-dark shrink-0" aria-hidden="true" />
          </a>
        </div>
        <p v-else class="text-xs text-text-muted">
          Ikuti @bekasku.id di Instagram, Facebook, X, YouTube, dan TikTok.
        </p>
      </div>

      <div class="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-3 shadow-2xs">
        <h2 class="text-base font-bold text-text">
          {{ t('Tautan & Aplikasi') }}
        </h2>

        <div class="divide-y divide-border">
          <NuxtLink
            to="/policy/terms"
            class="min-h-[44px] py-2 flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-text hover:text-primary-dark transition-colors"
          >
            <span class="flex items-center gap-2.5">
              <FileText class="w-4 h-4 text-primary-dark" aria-hidden="true" />
              <span>{{ t('Syarat & Ketentuan') }}</span>
            </span>
            <ChevronRight class="w-4 h-4 text-text-muted" aria-hidden="true" />
          </NuxtLink>

          <NuxtLink
            to="/policy/privacy"
            class="min-h-[44px] py-2 flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-text hover:text-primary-dark transition-colors"
          >
            <span class="flex items-center gap-2.5">
              <ShieldCheck class="w-4 h-4 text-primary-dark" aria-hidden="true" />
              <span>{{ t('Kebijakan Privasi') }}</span>
            </span>
            <ChevronRight class="w-4 h-4 text-text-muted" aria-hidden="true" />
          </NuxtLink>

          <NuxtLink
            to="/safety-guide"
            class="min-h-[44px] py-2 flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-text hover:text-primary-dark transition-colors"
          >
            <span class="flex items-center gap-2.5">
              <Lock class="w-4 h-4 text-primary-dark" aria-hidden="true" />
              <span>{{ t('Panduan Keamanan') }}</span>
            </span>
            <ChevronRight class="w-4 h-4 text-text-muted" aria-hidden="true" />
          </NuxtLink>

          <NuxtLink
            to="/faq"
            class="min-h-[44px] py-2 flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-text hover:text-primary-dark transition-colors"
          >
            <span class="flex items-center gap-2.5">
              <HelpCircle class="w-4 h-4 text-primary-dark" aria-hidden="true" />
              <span>{{ t('FAQ & Bantuan') }}</span>
            </span>
            <ChevronRight class="w-4 h-4 text-text-muted" aria-hidden="true" />
          </NuxtLink>
        </div>

        <div class="pt-2 flex gap-2">
          <a
            :href="PLAY_STORE_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="min-h-[44px] flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-text hover:bg-dark text-white text-xs font-semibold transition-colors"
          >
            <span>Google Play</span>
            <ExternalLink class="w-3.5 h-3.5" aria-hidden="true" />
          </a>
          <a
            :href="APP_STORE_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="min-h-[44px] flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface hover:bg-surface-2 text-text text-xs font-semibold transition-colors"
          >
            <span>App Store</span>
            <ExternalLink class="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
