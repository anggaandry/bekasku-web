<template>
  <div v-if="categories.length > 0" class="py-3 px-4">
    <h2 class="font-outfit font-bold text-base text-text mb-3">
      Kategori Pilihan
    </h2>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="cat in categories"
        :key="cat.id || cat._id"
        type="button"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface-2 hover:bg-primary/8 border border-border hover:border-primary/30 text-xs sm:text-sm font-outfit text-text hover:text-primary transition-colors cursor-pointer"
        @click="emit('select', cat)"
      >
        <img
          v-if="cat.image"
          :src="sanitizeMediaUrl(cat.image, '')"
          :alt="cat.name"
          width="18"
          height="18"
          class="w-[18px] h-[18px] object-contain shrink-0"
          loading="lazy"
        />
        <span>{{ cat.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchCategoryItem } from '~/types/search'
import { sanitizeMediaUrl } from '~/utils/media'

defineProps<{
  categories: SearchCategoryItem[]
}>()

const emit = defineEmits<{
  select: [category: SearchCategoryItem]
}>()
</script>

