<script setup lang="ts">
import { LayoutGrid, ShieldCheck, CreditCard, Truck, Award } from 'lucide-vue-next'
import type { FaqCategoryId, FaqCategoryMeta } from '~/types/help'

const props = defineProps<{
  categories: FaqCategoryMeta[]
  selectedCategory: FaqCategoryId
  counts: Record<FaqCategoryId, number>
}>()

const emit = defineEmits<{
  (e: 'select', category: FaqCategoryId): void
}>()

const iconMap = {
  LayoutGrid,
  ShieldCheck,
  CreditCard,
  Truck,
  Award,
} as const
</script>

<template>
  <section aria-label="Kategori Topik Bantuan">
    <!-- Mobile Horizontal Scroll Chips (< md) -->
    <div class="flex md:hidden items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      <button
        v-for="cat in props.categories"
        :key="cat.id"
        type="button"
        class="min-h-[44px] px-3.5 py-2 rounded-full border font-outfit text-xs font-semibold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        :class="
          props.selectedCategory === cat.id
            ? 'bg-primary text-white border-primary shadow-xs'
            : 'bg-white text-text border-border hover:border-primary/40'
        "
        @click="emit('select', cat.id)"
      >
        <component
          :is="iconMap[cat.iconName]"
          class="w-3.5 h-3.5 shrink-0"
          :class="props.selectedCategory === cat.id ? 'text-white' : 'text-primary'"
          aria-hidden="true"
        />
        <span>{{ cat.label }}</span>
        <span
          class="px-1.5 py-0.5 rounded-full text-[10px] leading-none font-bold"
          :class="
            props.selectedCategory === cat.id
              ? 'bg-white/20 text-white'
              : 'bg-surface-2 text-text-muted'
          "
        >
          {{ props.counts[cat.id] || 0 }}
        </span>
      </button>
    </div>

    <!-- Desktop & Tablet Grid Cards (md+) -->
    <div class="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-3">
      <button
        v-for="cat in props.categories"
        :key="cat.id"
        type="button"
        class="p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        :class="
          props.selectedCategory === cat.id
            ? 'bg-chip-soft-bg border-primary shadow-xs'
            : 'bg-white border-border hover:border-primary/40 hover:bg-surface-2/60'
        "
        @click="emit('select', cat.id)"
      >
        <div class="flex items-center justify-between gap-2">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            :class="
              props.selectedCategory === cat.id
                ? 'bg-primary text-white'
                : 'bg-primary/10 text-primary'
            "
          >
            <component :is="iconMap[cat.iconName]" class="w-4.5 h-4.5" aria-hidden="true" />
          </div>
          <span
            class="px-2 py-0.5 rounded-full font-outfit font-bold text-[11px]"
            :class="
              props.selectedCategory === cat.id
                ? 'bg-primary text-white'
                : 'bg-surface-2 text-text-muted'
            "
          >
            {{ props.counts[cat.id] || 0 }}
          </span>
        </div>

        <div class="space-y-0.5">
          <p class="font-outfit font-bold text-xs lg:text-sm text-text leading-snug">
            {{ cat.label }}
          </p>
          <p class="font-outfit text-[11px] text-text-muted line-clamp-2 leading-snug">
            {{ cat.description }}
          </p>
        </div>
      </button>
    </div>
  </section>
</template>

