<script setup lang="ts">
import { ChevronDown, ChevronUp, Search, X } from 'lucide-vue-next'
import type { LegalLanguage } from '~/types/legal'

const props = withDefaults(
  defineProps<{
    modelValue: string
    matchCount: number
    activeIndex: number
    lang?: LegalLanguage
  }>(),
  {
    lang: 'id',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'clear'): void
}>()

const hasQuery = computed(() => props.modelValue.trim().length > 0)

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && hasQuery.value && props.matchCount > 0) {
    e.preventDefault()
    if (e.shiftKey) {
      emit('prev')
    } else {
      emit('next')
    }
  }
}
</script>

<template>
  <div class="bg-surface border border-border rounded-2xl p-3 sm:p-4 shadow-2xs space-y-2.5 font-outfit print:hidden">
    <div class="flex flex-col sm:flex-row sm:items-center gap-2.5">
      <div class="relative flex-1 min-w-0">
        <label for="legal-search-input" class="sr-only">
          {{ props.lang === 'en' ? 'Search within document' : 'Cari kata kunci dalam dokumen' }}
        </label>
        <Search
          class="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="legal-search-input"
          name="legal_search"
          type="search"
          :value="props.modelValue"
          :placeholder="props.lang === 'en' ? 'Search keywords (escrow, KYC)...' : 'Cari kata kunci (rekber, unboxing)...'"
          class="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-surface-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors"
          @input="handleInput"
          @keydown="handleKeydown"
        />
        <button
          v-if="hasQuery"
          type="button"
          class="w-8 h-8 rounded-full hover:bg-border/60 flex items-center justify-center text-text-muted hover:text-text absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
          :aria-label="props.lang === 'en' ? 'Clear search' : 'Hapus pencarian'"
          @click="emit('clear')"
        >
          <X class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <!-- Match Counter & Prev/Next Jump -->
      <div
        v-if="hasQuery"
        class="flex items-center justify-between sm:justify-end gap-2 shrink-0"
      >
        <span
          class="text-xs font-semibold px-2.5 py-1.5 rounded-lg border"
          :class="
            props.matchCount > 0
              ? 'bg-badge-bg/35 border-badge-bg text-badge-text'
              : 'bg-surface-2 border-border text-text-muted'
          "
        >
          <template v-if="props.matchCount > 0">
            {{ props.activeIndex + 1 }}/{{ props.matchCount }}
            {{ props.lang === 'en' ? 'matches' : 'kata ditemukan' }}
          </template>
          <template v-else>
            {{ props.lang === 'en' ? 'No matches found' : '0 kata ditemukan' }}
          </template>
        </span>

        <div v-if="props.matchCount > 0" class="flex items-center gap-1">
          <button
            type="button"
            class="min-w-[44px] min-h-[44px] rounded-xl border border-border bg-surface hover:bg-surface-2 flex items-center justify-center text-text cursor-pointer transition-colors"
            :aria-label="props.lang === 'en' ? 'Previous match' : 'Hasil sebelumnya'"
            @click="emit('prev')"
          >
            <ChevronUp class="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="min-w-[44px] min-h-[44px] rounded-xl border border-border bg-surface hover:bg-surface-2 flex items-center justify-center text-text cursor-pointer transition-colors"
            :aria-label="props.lang === 'en' ? 'Next match' : 'Hasil berikutnya'"
            @click="emit('next')"
          >
            <ChevronDown class="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

