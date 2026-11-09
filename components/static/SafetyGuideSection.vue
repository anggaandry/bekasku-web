<script setup lang="ts">
import type { Component } from 'vue'
import {
  CheckCircle2,
  FileText,
  Flag,
  Headset,
  Link2,
  LockKeyhole,
  QrCode,
  ShieldAlert,
  XCircle,
} from 'lucide-vue-next'
import {
  SAFETY_DONT_ITEMS,
  SAFETY_DO_ITEMS,
  SAFETY_GUIDE_ITEMS,
} from '~/composables/useLegalPolicy'
import { useHelpChatStore } from '~/stores/helpChat'
import { useLocale } from '~/composables/useLocale'
import type { SafetyTipItem } from '~/types/legal'

const helpChatStore = useHelpChatStore()
const { t } = useLocale()

const tipIcons: Record<SafetyTipItem['iconName'], Component> = {
  ShieldAlert,
  Link2,
  LockKeyhole,
  QrCode,
  Flag,
}

function handleReportSecurityIssue() {
  helpChatStore.openHelpChat({
    topic: 'general',
    initialMessage: 'Halo BekasKu Center, saya ingin melaporkan atau berkonsultasi terkait keamanan transaksi.',
  })
}
</script>

<template>
  <div class="space-y-6 sm:space-y-8 font-outfit">
    <!-- Asymmetric Hero with Red Flat Vector Illustration -->
    <section class="bg-surface border border-border rounded-2xl p-5 sm:p-8 shadow-2xs">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div class="md:col-span-7 space-y-3.5">
          <h1 class="text-2xl sm:text-3xl font-bold text-text tracking-tight leading-tight">
            {{ t('Panduan Keamanan Transaksi') }}
          </h1>

          <p class="text-sm sm:text-base text-text-muted leading-relaxed">
            {{ t('Ikuti lima aturan sederhana berikut agar transaksi jual beli di BekasKu tetap aman dari penipuan.') }}
          </p>

          <div class="pt-1 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              class="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors cursor-pointer"
              @click="handleReportSecurityIssue"
            >
              <Headset class="w-4 h-4" aria-hidden="true" />
              <span>{{ t('Laporkan ke BekasKu Center') }}</span>
            </button>

            <NuxtLink
              to="/policy/terms"
              class="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-2 text-text text-sm font-semibold transition-colors"
            >
              <FileText class="w-4 h-4 text-text-muted" aria-hidden="true" />
              <span>{{ t('Syarat & Ketentuan') }}</span>
            </NuxtLink>
          </div>
        </div>

        <div class="md:col-span-5 flex justify-center">
          <img
            src="/images/static/safety-guide-illust.png"
            alt="Ilustrasi keamanan transaksi BekasKu"
            width="320"
            height="239"
            loading="eager"
            fetchpriority="high"
            class="w-full max-w-[230px] sm:max-w-[280px] h-auto object-contain"
          />
        </div>
      </div>
    </section>

    <!-- 5 Core Rules: Single Crisp Divided List Card -->
    <section aria-labelledby="core-safety-heading" class="space-y-3">
      <h2 id="core-safety-heading" class="text-lg sm:text-xl font-bold text-text">
        {{ t('5 Aturan Utama') }}
      </h2>

      <ol class="bg-surface border border-border rounded-2xl divide-y divide-border shadow-2xs">
        <li
          v-for="tip in SAFETY_GUIDE_ITEMS"
          :key="tip.id"
          class="p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4"
        >
          <div class="w-10 h-10 rounded-xl bg-chip-soft-bg text-primary-dark flex items-center justify-center shrink-0 mt-0.5">
            <component :is="tipIcons[tip.iconName]" class="w-5 h-5" aria-hidden="true" />
          </div>

          <div class="min-w-0 flex-1 space-y-1">
            <h3 class="text-sm sm:text-base font-bold text-text leading-snug">
              {{ tip.number }}. {{ tip.title }}
            </h3>
            <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
              {{ tip.description }}
            </p>
          </div>
        </li>
      </ol>
    </section>

    <!-- Compact Do & Don't Checklist -->
    <section aria-labelledby="do-dont-heading" class="space-y-3">
      <h2 id="do-dont-heading" class="text-lg sm:text-xl font-bold text-text">
        {{ t('Lakukan & Hindari') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div class="bg-surface border border-border rounded-2xl p-5 space-y-3.5 shadow-2xs">
          <div class="flex items-center gap-2 pb-2.5 border-b border-border">
            <CheckCircle2 class="w-5 h-5 text-success shrink-0" aria-hidden="true" />
            <h3 class="text-base font-bold text-success-title">
              {{ t('Lakukan') }}
            </h3>
          </div>

          <ul class="space-y-3">
            <li
              v-for="item in SAFETY_DO_ITEMS"
              :key="item.title"
              class="flex items-start gap-2.5"
            >
              <CheckCircle2 class="w-4 h-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
              <div class="space-y-0.5">
                <p class="text-sm font-semibold text-text leading-snug">{{ item.title }}</p>
                <p class="text-xs text-text-muted leading-relaxed">{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </div>

        <div class="bg-surface border border-border rounded-2xl p-5 space-y-3.5 shadow-2xs">
          <div class="flex items-center gap-2 pb-2.5 border-b border-border">
            <XCircle class="w-5 h-5 text-danger shrink-0" aria-hidden="true" />
            <h3 class="text-base font-bold text-primary-dark">
              {{ t('Hindari') }}
            </h3>
          </div>

          <ul class="space-y-3">
            <li
              v-for="item in SAFETY_DONT_ITEMS"
              :key="item.title"
              class="flex items-start gap-2.5"
            >
              <XCircle class="w-4 h-4 text-danger shrink-0 mt-0.5" aria-hidden="true" />
              <div class="space-y-0.5">
                <p class="text-sm font-semibold text-text leading-snug">{{ item.title }}</p>
                <p class="text-xs text-text-muted leading-relaxed">{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
