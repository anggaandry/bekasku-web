<template>
  <div
    v-if="loading || subcategories.length > 0"
    class="w-full bg-white border-b border-border/70 px-3 sm:px-4 md:px-0 py-2.5"
  >
    <!-- Shimmer Loading -->
    <div v-if="loading && subcategories.length === 0" class="flex items-center gap-2 overflow-x-auto scrollbar-none">
      <div
        v-for="n in 4"
        :key="`sub-chip-skel-${n}`"
        class="h-8 w-24 rounded-full bg-surface-2 animate-shimmer shrink-0"
      />
    </div>

    <!-- Subcategory Filter Pills -->
    <div v-else class="flex items-center flex-wrap gap-2">
      <button
        type="button"
        class="px-3.5 py-1.5 rounded-full font-outfit text-xs font-medium border transition-colors cursor-pointer"
        :class="
          !selectedId
            ? 'bg-primary text-white border-primary font-semibold'
            : 'bg-surface-2/70 text-text-muted border-border hover:border-primary/40 hover:text-text'
        "
        @click="emit('select', '')"
      >
        Semua
      </button>

      <button
        v-for="sub in subcategories"
        :key="sub.id || sub._id"
        type="button"
        class="px-3.5 py-1.5 rounded-full font-outfit text-xs font-medium border transition-colors cursor-pointer"
        :class="
          selectedId === String(sub.id || sub._id)
            ? 'bg-primary text-white border-primary font-semibold'
            : 'bg-surface-2/70 text-text-muted border-border hover:border-primary/40 hover:text-text'
        "
        @click="onToggleSub(String(sub.id || sub._id))"
      >
        {{ sub.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Subcategory } from '~/types/category'

interface SubcategoryChipsProps {
  subcategories: Subcategory[]
  selectedId?: string
  loading?: boolean
}

const props = withDefaults(defineProps<SubcategoryChipsProps>(), {
  selectedId: '',
  loading: false,
})

const emit = defineEmits<{
  select: [subcategoryId: string]
}>()

function onToggleSub(id: string) {
  if (props.selectedId === id) {
    emit('select', '')
  } else {
    emit('select', id)
  }
}
</script>

