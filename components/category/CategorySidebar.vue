<template>
  <aside
    ref="sidebarRef"
    aria-label="Daftar Kategori"
    class="w-[106px] sm:w-[122px] md:w-52 lg:w-60 shrink-0 bg-white md:rounded-2xl md:border md:border-border overflow-y-auto scrollbar-none select-none"
  >
    <!-- Desktop Header inside Sidebar -->
    <div class="hidden md:flex items-center gap-2 px-4 py-3 border-b border-border">
      <LayoutGrid class="w-4 h-4 text-primary shrink-0" />
      <h2 class="font-outfit font-bold text-sm text-text">
        Semua Kategori
      </h2>
    </div>

    <!-- Shimmer Loading State -->
    <div v-if="loading && categories.length === 0" class="py-2 space-y-2 px-2.5">
      <div
        v-for="n in 12"
        :key="`cat-side-skel-${n}`"
        class="h-9 rounded-lg bg-surface-2 animate-shimmer"
      />
    </div>

    <!-- Category List (Matches Mobile Screenshots 1 & 2) -->
    <nav v-else class="divide-y divide-border/30 md:divide-y-0 md:py-1">
      <button
        v-for="cat in categories"
        :id="`cat-nav-${cat.id || cat._id}`"
        :key="cat.id || cat._id"
        :ref="(el) => setItemRef(String(cat.id || cat._id), el as HTMLElement | null)"
        type="button"
        class="w-full text-left px-3 py-3.5 md:px-4 md:py-3 font-outfit text-[13px] md:text-sm leading-snug transition-colors cursor-pointer flex items-center justify-between gap-1.5"
        :class="
          isSelected(cat)
            ? 'bg-primary/10 text-primary font-semibold'
            : 'bg-white text-text font-normal hover:bg-surface-2'
        "
        @click="emit('select', cat)"
      >
        <span class="line-clamp-2 break-words">{{ cat.name }}</span>
        <ChevronRight
          v-if="isSelected(cat)"
          class="hidden md:block w-4 h-4 text-primary shrink-0"
        />
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { LayoutGrid, ChevronRight } from 'lucide-vue-next'
import type { Category } from '~/types/category'

interface CategorySidebarProps {
  categories: Category[]
  selectedId: string
  loading?: boolean
}

const props = withDefaults(defineProps<CategorySidebarProps>(), {
  loading: false,
})

const emit = defineEmits<{
  select: [category: Category]
}>()

const sidebarRef = ref<HTMLElement | null>(null)
const itemRefs = new Map<string, HTMLElement>()

function setItemRef(id: string, el: HTMLElement | null) {
  if (el) {
    itemRefs.set(id, el)
  } else {
    itemRefs.delete(id)
  }
}

function isSelected(cat: Category): boolean {
  const cId = String(cat.id || cat._id || '')
  return Boolean(cId && cId === props.selectedId)
}

function scrollSelectedIntoView() {
  if (!import.meta.client || !props.selectedId) return
  nextTick(() => {
    const targetEl = itemRefs.get(props.selectedId)
    if (targetEl && sidebarRef.value) {
      targetEl.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  })
}

watch(
  () => [props.selectedId, props.categories.length],
  () => {
    scrollSelectedIntoView()
  }
)

onMounted(() => {
  scrollSelectedIntoView()
})
</script>

