<script setup lang="ts">
import { ref } from 'vue'
import { Check, Printer, Share2 } from 'lucide-vue-next'
import type { LegalDocKind, LegalLanguage } from '~/types/legal'

const props = withDefaults(
  defineProps<{
    kind: LegalDocKind
    title: string
    version: string
    lastUpdated: string
    lang?: LegalLanguage
    showLanguageToggle?: boolean
  }>(),
  {
    lang: 'id',
    showLanguageToggle: false,
  },
)

const emit = defineEmits<{
  (e: 'change-lang', lang: LegalLanguage): void
}>()

const { showNotification } = useNotification()
const copiedPageLink = ref(false)

function handlePrint() {
  if (!import.meta.client) return
  window.print()
}

async function handleCopyPageLink() {
  if (!import.meta.client) return
  const url = window.location.href
  try {
    await navigator.clipboard.writeText(url)
    copiedPageLink.value = true
    showNotification({
      type: 'success',
      message: props.lang === 'en' ? 'Document link copied to clipboard.' : 'Tautan dokumen berhasil disalin.',
    })
    setTimeout(() => {
      copiedPageLink.value = false
    }, 2200)
  } catch {
    showNotification({
      type: 'error',
      message: props.lang === 'en' ? 'Unable to copy link.' : 'Gagal menyalin tautan dokumen.',
    })
  }
}
</script>

<template>
  <section class="bg-surface border-b border-border pt-3 pb-6 sm:pt-4 sm:pb-8 font-outfit print:border-b print:py-4">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
      <!-- Minimalist Underline Switcher Tabs -->
      <nav
        aria-label="Navigasi dokumen legal"
        class="flex items-center gap-2.5 sm:gap-7 border-b border-border overflow-x-auto no-scrollbar print:hidden"
      >
        <NuxtLink
          to="/policy/terms"
          class="min-h-[44px] inline-flex items-center text-[11.5px] sm:text-sm whitespace-nowrap border-b-2 -mb-px transition-colors"
          :class="
            props.kind === 'terms'
              ? 'border-primary text-primary-dark font-bold'
              : 'border-transparent text-text-muted hover:text-text font-medium'
          "
        >
          {{ props.lang === 'en' ? 'Terms & Conditions' : 'Syarat & Ketentuan' }}
        </NuxtLink>

        <NuxtLink
          to="/policy/privacy"
          class="min-h-[44px] inline-flex items-center text-[11.5px] sm:text-sm whitespace-nowrap border-b-2 -mb-px transition-colors"
          :class="
            props.kind === 'privacy'
              ? 'border-primary text-primary-dark font-bold'
              : 'border-transparent text-text-muted hover:text-text font-medium'
          "
        >
          {{ props.lang === 'en' ? 'Privacy Policy' : 'Kebijakan Privasi' }}
        </NuxtLink>

        <NuxtLink
          to="/safety-guide"
          class="min-h-[44px] inline-flex items-center text-[11.5px] sm:text-sm whitespace-nowrap border-b-2 border-transparent -mb-px text-text-muted hover:text-text font-medium transition-colors"
        >
          {{ props.lang === 'en' ? 'Safety Guide' : 'Panduan Keamanan' }}
        </NuxtLink>
      </nav>

      <!-- Clean Asymmetric Header with Bespoke Red Vector Illustration -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-3 max-w-2xl">
          <h1 class="text-2xl sm:text-3xl font-bold text-text tracking-tight leading-tight">
            {{ props.title }}
          </h1>

          <p class="text-xs sm:text-sm text-text-muted">
            PT Jantaka Ladang Unggul
            <span class="mx-1.5 text-text-subtle" aria-hidden="true">&bull;</span>
            {{ props.lang === 'en' ? 'Updated' : 'Diperbarui' }} {{ props.lastUpdated }}
            <span class="mx-1.5 text-text-subtle" aria-hidden="true">&bull;</span>
            {{ props.lang === 'en' ? 'Version' : 'Versi' }} {{ props.version }}
          </p>

          <!-- Actions -->
          <div class="pt-1 flex flex-wrap items-center gap-2.5 print:hidden">
            <div
              v-if="props.showLanguageToggle"
              class="inline-flex rounded-xl border border-border bg-surface-2 p-0.5"
              role="group"
              aria-label="Pilih bahasa dokumen"
            >
              <button
                type="button"
                class="min-h-[42px] min-w-[44px] px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                :class="props.lang === 'id' ? 'bg-surface text-text shadow-2xs border border-border' : 'text-text-muted hover:text-text'"
                @click="emit('change-lang', 'id')"
              >
                ID
              </button>
              <button
                type="button"
                class="min-h-[42px] min-w-[44px] px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                :class="props.lang === 'en' ? 'bg-surface text-text shadow-2xs border border-border' : 'text-text-muted hover:text-text'"
                @click="emit('change-lang', 'en')"
              >
                EN
              </button>
            </div>

            <button
              type="button"
              class="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-2 text-xs font-semibold text-text transition-colors cursor-pointer"
              @click="handleCopyPageLink"
            >
              <Check v-if="copiedPageLink" class="w-4 h-4 text-success" aria-hidden="true" />
              <Share2 v-else class="w-4 h-4 text-text-muted" aria-hidden="true" />
              <span>{{ copiedPageLink ? (props.lang === 'en' ? 'Copied' : 'Tersalin') : (props.lang === 'en' ? 'Copy Link' : 'Salin Tautan') }}</span>
            </button>

            <button
              type="button"
              class="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-text hover:bg-dark text-white text-xs font-semibold transition-colors cursor-pointer"
              @click="handlePrint"
            >
              <Printer class="w-4 h-4" aria-hidden="true" />
              <span>{{ props.lang === 'en' ? 'Print / PDF' : 'Cetak / PDF' }}</span>
            </button>
          </div>
        </div>

        <div class="hidden md:flex shrink-0 items-center justify-center print:hidden">
          <img
            src="/images/static/legal-terms-illust.png"
            :alt="props.lang === 'en' ? 'Ilustrasi dokumen legal BekasKu' : 'Ilustrasi syarat dan ketentuan BekasKu'"
            width="224"
            height="167"
            loading="eager"
            fetchpriority="high"
            class="w-48 lg:w-56 h-auto object-contain"
          />
        </div>
      </div>
    </div>
  </section>
</template>
