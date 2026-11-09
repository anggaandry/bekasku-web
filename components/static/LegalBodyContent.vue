<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import AppSkeleton from '~/components/shared/AppSkeleton.vue'
import AppErrorState from '~/components/shared/AppErrorState.vue'
import { buildHighlightedHtml } from '~/composables/useLegalPolicy'
import { sanitizeHtml } from '~/utils/sanitizeHtml'

const props = withDefaults(
  defineProps<{
    html: string
    loading?: boolean
    error?: string
    searchQuery?: string
    activeMatchIndex?: number
  }>(),
  {
    loading: false,
    error: '',
    searchQuery: '',
    activeMatchIndex: 0,
  },
)

const emit = defineEmits<{
  (e: 'retry'): void
  (e: 'update:matchCount', count: number): void
}>()

const bodyContainerRef = ref<HTMLElement | null>(null)

const highlighted = computed(() => {
  if (!props.html) {
    return { html: '', matchCount: 0 }
  }
  const result = buildHighlightedHtml(props.html, props.searchQuery || '', props.activeMatchIndex || 0)
  return {
    html: sanitizeHtml(result.html),
    matchCount: result.matchCount,
  }
})

watch(
  () => highlighted.value.matchCount,
  (count) => {
    emit('update:matchCount', count)
  },
  { immediate: true },
)

watch(
  [() => props.searchQuery, () => props.activeMatchIndex],
  async ([q, idx]) => {
    if (!import.meta.client || !q?.trim() || highlighted.value.matchCount === 0) return
    await nextTick()
    const target = bodyContainerRef.value?.querySelector(`[data-legal-match-idx="${idx}"]`)
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  },
  { flush: 'post' },
)
</script>

<template>
  <div class="font-outfit">
    <!-- Loading State -->
    <div
      v-if="props.loading"
      class="bg-surface border border-border rounded-2xl p-6 sm:p-10 space-y-6 shadow-2xs"
    >
      <div class="space-y-3">
        <AppSkeleton width="180px" height="24px" custom-class="rounded-lg" />
        <AppSkeleton width="100%" height="16px" />
        <AppSkeleton width="92%" height="16px" />
        <AppSkeleton width="84%" height="16px" />
      </div>
      <div class="space-y-3 pt-4 border-t border-border">
        <AppSkeleton width="240px" height="24px" custom-class="rounded-lg" />
        <AppSkeleton width="100%" height="16px" />
        <AppSkeleton width="95%" height="16px" />
        <AppSkeleton width="78%" height="16px" />
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="props.error"
      class="bg-surface border border-border rounded-2xl p-6 shadow-2xs"
    >
      <AppErrorState
        title="Gagal memuat dokumen"
        :message="props.error"
        @retry="emit('retry')"
      />
    </div>

    <!-- Rendered Legal Document HTML -->
    <article
      v-else
      ref="bodyContainerRef"
      class="legal-prose bg-surface border border-border rounded-2xl p-5 sm:p-8 lg:p-10 shadow-2xs print:border-0 print:shadow-none print:p-0"
      v-html="highlighted.html"
    />
  </div>
</template>

<style scoped>
.legal-prose {
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-chip-outline-text);
}

@media (min-width: 768px) {
  .legal-prose {
    font-size: 16px;
  }
}

.legal-prose :deep(section) {
  scroll-margin-top: 120px;
}

.legal-prose :deep(section + section) {
  margin-top: 2.25rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.legal-prose :deep(h2),
.legal-prose :deep(h3) {
  font-family: var(--font-outfit), sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  scroll-margin-top: 120px;
}

@media (min-width: 640px) {
  .legal-prose :deep(h2),
  .legal-prose :deep(h3) {
    font-size: 1.3rem;
  }
}

.legal-prose :deep(h4) {
  font-family: var(--font-outfit), sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary-dark);
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.legal-prose :deep(p) {
  margin-bottom: 0.75rem;
  color: var(--color-chip-outline-text);
}

.legal-prose :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-bottom: 0.875rem;
}

.legal-prose :deep(ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.875rem;
}

.legal-prose :deep(li) {
  margin-bottom: 0.5rem;
  color: var(--color-chip-outline-text);
}

.legal-prose :deep(li strong),
.legal-prose :deep(p strong) {
  color: var(--color-text);
  font-weight: 600;
}

.legal-prose :deep(a) {
  color: var(--color-primary-dark);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.legal-prose :deep(a:hover) {
  color: var(--color-primary);
}

.legal-prose :deep(.legal-callout) {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 0.875rem;
  font-size: 0.875rem;
  line-height: 1.65;
}

.legal-prose :deep(.legal-callout p:last-child) {
  margin-bottom: 0;
}

@media print {
  .legal-prose {
    font-size: 11pt;
    line-height: 1.55;
    color: var(--color-text);
  }
  .legal-prose :deep(section + section) {
    break-inside: avoid-page;
  }
}
</style>

