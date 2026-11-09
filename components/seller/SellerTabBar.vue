<template>
  <div class="grid grid-cols-2 border-b border-border bg-white w-full">
    <!-- Tab Produk -->
    <button
      type="button"
      class="py-3 text-center font-outfit text-sm transition-colors relative cursor-pointer"
      :class="activeTab === 'products' ? 'text-primary font-semibold' : 'text-text-muted hover:text-text font-medium'"
      @click="$emit('update:activeTab', 'products')"
    >
      <span>Produk</span>
      <span
        v-if="activeTab === 'products'"
        class="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
      />
    </button>

    <!-- Tab Penilaian -->
    <button
      type="button"
      class="py-3 text-center font-outfit text-sm transition-colors relative cursor-pointer"
      :class="activeTab === 'reviews' ? 'text-primary font-semibold' : 'text-text-muted hover:text-text font-medium'"
      @click="$emit('update:activeTab', 'reviews')"
    >
      <span>Penilaian</span>
      <span
        v-if="activeTab === 'reviews'"
        class="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeTab: 'products' | 'reviews'
}>()

defineEmits<{
  (e: 'update:activeTab', tab: 'products' | 'reviews'): void
}>()
</script>
