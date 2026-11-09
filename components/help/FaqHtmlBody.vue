<script setup lang="ts">
import { computed } from 'vue'
import { sanitizeHtml } from '~/utils/sanitizeHtml'

const props = withDefaults(
  defineProps<{
    html: string
    size?: 'sm' | 'base'
  }>(),
  {
    size: 'sm',
  },
)

const safeHtml = computed(() => sanitizeHtml(props.html))
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    class="faq-answer-html font-outfit text-text leading-relaxed"
    :class="props.size === 'base' ? 'text-sm sm:text-base is-spacious' : 'text-sm'"
    v-html="safeHtml"
  />
</template>

<style scoped>
.faq-answer-html :deep(p) {
  margin-bottom: 0.75rem;
}
.faq-answer-html.is-spacious :deep(p) {
  margin-bottom: 0.875rem;
}
.faq-answer-html :deep(p:last-child) {
  margin-bottom: 0;
}
.faq-answer-html :deep(ul),
.faq-answer-html :deep(ol) {
  padding-left: 1.25rem;
  margin-bottom: 0.75rem;
}
.faq-answer-html.is-spacious :deep(ul),
.faq-answer-html.is-spacious :deep(ol) {
  margin-bottom: 0.875rem;
}
.faq-answer-html :deep(ul) {
  list-style-type: disc;
}
.faq-answer-html :deep(ol) {
  list-style-type: decimal;
}
.faq-answer-html :deep(strong),
.faq-answer-html :deep(b) {
  font-weight: 700;
  color: var(--color-text);
}
</style>

