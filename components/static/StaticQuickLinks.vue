<script setup lang="ts">
import type { LegalLanguage } from '~/types/legal'
import { useLocale } from '~/composables/useLocale'

const props = withDefaults(
  defineProps<{
    current?: '/about' | '/safety-guide' | '/policy/terms' | '/policy/privacy' | '/faq'
    lang?: LegalLanguage
  }>(),
  {
    current: undefined,
    lang: 'id',
  },
)

const { t } = useLocale()

const links = computed(() => [
  {
    label: t('Tentang Kami'),
    to: '/about' as const,
  },
  {
    label: t('Panduan Keamanan'),
    to: '/safety-guide' as const,
  },
  {
    label: t('Syarat & Ketentuan'),
    to: '/policy/terms' as const,
  },
  {
    label: t('Kebijakan Privasi'),
    to: '/policy/privacy' as const,
  },
  {
    label: 'FAQ',
    to: '/faq' as const,
  },
])
</script>

<template>
  <nav
    aria-label="Tautan informasi BekasKu"
    class="md:hidden border-t border-border pt-5 mt-8 font-outfit print:hidden"
  >
    <p class="text-xs font-semibold text-text mb-2.5">
      {{ t('Halaman Informasi') }}
    </p>
    <div class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="item in links"
        :key="item.to"
        :to="item.to"
        class="min-h-[44px] inline-flex items-center px-3.5 py-2 rounded-xl border text-xs transition-colors"
        :class="
          props.current === item.to
            ? 'bg-chip-soft-bg border-chip-soft-border text-primary-dark font-semibold'
            : 'bg-surface border-border text-text-muted hover:text-text font-medium'
        "
      >
        {{ item.label }}
      </NuxtLink>
    </div>
  </nav>
</template>

