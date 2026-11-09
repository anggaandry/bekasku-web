<script setup lang="ts">
import { Headset, ShieldCheck } from 'lucide-vue-next'
import { useHelpChatStore } from '~/stores/helpChat'
import { useLocale } from '~/composables/useLocale'
import type { AboutCompanyInfo } from '~/types/legal'

defineProps<{
  company: AboutCompanyInfo
}>()

const helpChatStore = useHelpChatStore()
const { t } = useLocale()

function handleOpenHelpChat() {
  helpChatStore.openHelpChat({ topic: 'general' })
}
</script>

<template>
  <section class="font-outfit bg-surface border border-border rounded-2xl p-5 sm:p-8 shadow-2xs">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
      <div class="md:col-span-7 space-y-4">
        <div class="flex items-center gap-3">
          <img
            src="/images/logo_red.png"
            alt="BekasKu"
            width="126"
            height="32"
            class="h-7 w-auto object-contain"
          />
          <span class="text-xs font-medium text-text-muted">
            {{ t('Versi') }} {{ company.appVersion }}
          </span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-bold text-text tracking-tight leading-tight">
          {{ t('Tentang BekasKu') }}
        </h1>

        <p class="text-sm sm:text-base text-text-muted leading-relaxed">
          {{ company.mission }}
        </p>

        <div class="pt-1 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            class="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors cursor-pointer"
            @click="handleOpenHelpChat"
          >
            <Headset class="w-4 h-4" aria-hidden="true" />
            <span>{{ t('Hubungi BekasKu Center') }}</span>
          </button>

          <NuxtLink
            to="/safety-guide"
            class="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-2 text-text text-sm font-semibold transition-colors"
          >
            <ShieldCheck class="w-4 h-4 text-primary-dark" aria-hidden="true" />
            <span>{{ t('Panduan Keamanan') }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="md:col-span-5 flex justify-center">
        <img
          src="/images/static/about-bekasku-illust.png"
          alt="Ilustrasi jual beli barang aman di BekasKu"
          width="320"
          height="239"
          loading="eager"
          fetchpriority="high"
          class="w-full max-w-[240px] sm:max-w-[300px] h-auto object-contain"
        />
      </div>
    </div>
  </section>
</template>
