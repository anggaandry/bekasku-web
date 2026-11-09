<script setup lang="ts">
import { ArrowLeft, Headset } from 'lucide-vue-next'
import AppHelpButton from '~/components/shared/AppHelpButton.vue'

export interface HelpBreadcrumbItem {
  label: string
  to?: string
}

const props = withDefaults(
  defineProps<{
    crumbs: HelpBreadcrumbItem[]
    mobileTitle?: string
    backFallback?: string
    chatTooltip?: string
  }>(),
  {
    mobileTitle: 'FAQ & Bantuan',
    backFallback: '/help',
    chatTooltip: 'Chat BekasKu Center',
  },
)

const emit = defineEmits<{
  (e: 'open-help-chat'): void
}>()

const router = useRouter()

function goBack() {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    navigateTo(props.backFallback)
  }
}
</script>

<template>
  <!-- Mobile App Bar (< md) -->
  <header class="md:hidden sticky top-0 z-30 bg-white border-b border-border px-3 h-14 flex items-center justify-between gap-2 print:hidden">
    <button
      type="button"
      class="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
      aria-label="Kembali"
      @click="goBack"
    >
      <ArrowLeft class="w-5 h-5" aria-hidden="true" />
    </button>

    <span class="font-outfit font-bold text-base text-text truncate">
      {{ props.mobileTitle }}
    </span>

    <AppHelpButton :tooltip="props.chatTooltip" />
  </header>

  <!-- Desktop Breadcrumb Bar (md+) -->
  <div class="hidden md:block py-2.5 bg-white border-b border-border print:hidden">
    <div class="max-w-6xl mx-auto px-6 lg:px-8 flex items-center justify-between gap-4">
      <nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-xs font-outfit text-text-muted min-w-0">
        <template v-for="(crumb, idx) in props.crumbs" :key="`${crumb.label}-${idx}`">
          <span v-if="idx > 0" class="text-text-subtle shrink-0" aria-hidden="true">/</span>
          <NuxtLink
            v-if="crumb.to"
            :to="crumb.to"
            class="hover:text-primary transition-colors shrink-0"
          >
            {{ crumb.label }}
          </NuxtLink>
          <span v-else class="text-text font-semibold truncate">
            {{ crumb.label }}
          </span>
        </template>
      </nav>

      <button
        type="button"
        class="min-h-[32px] inline-flex items-center gap-1.5 text-xs font-outfit font-semibold text-primary hover:underline cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-primary rounded-md px-1.5"
        @click="emit('open-help-chat')"
      >
        <Headset class="w-3.5 h-3.5" aria-hidden="true" />
        <span>Chat BekasKu Center</span>
      </button>
    </div>
  </div>
</template>

