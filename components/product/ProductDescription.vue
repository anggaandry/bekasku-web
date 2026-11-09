<script setup lang="ts">
import { ChevronDown, ChevronUp } from 'lucide-vue-next'

const props = defineProps<{
  description?: string
}>()

const isExpanded = ref(false)
const isLong = computed(() => (props.description?.length || 0) > 200)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="space-y-2.5">
    <h2 class="text-sm font-bold text-text">Deskripsi</h2>

    <div
      v-if="description"
      class="text-xs sm:text-sm text-text/85 leading-relaxed whitespace-pre-line transition-all duration-300 relative"
      :class="{ 'line-clamp-5': !isExpanded && isLong }"
    >
      {{ description }}
    </div>
    <div v-else class="text-xs text-text-muted italic">
      Tidak ada deskripsi untuk produk ini.
    </div>

    <!-- Toggle button -->
    <button
      v-if="isLong"
      type="button"
      class="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer pt-0.5"
      @click="toggleExpand"
    >
      <span>{{ isExpanded ? 'Lihat Lebih Sedikit' : 'Baca Selengkapnya' }}</span>
      <ChevronUp v-if="isExpanded" class="w-3.5 h-3.5" />
      <ChevronDown v-else class="w-3.5 h-3.5" />
    </button>
  </div>
</template>
