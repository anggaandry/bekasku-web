<template>
  <div class="w-full bg-white">
    <!-- Row 1: Back Arrow + Search Bar + Bell & Cart (Mobile Only) -->
    <div class="px-3 sm:px-4 py-2 flex items-center gap-2 border-b border-border/60">
      <button
        type="button"
        class="p-1.5 -ml-1 text-text hover:text-primary rounded-lg transition-colors cursor-pointer shrink-0"
        aria-label="Kembali"
        @click="emit('back')"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>

      <div class="flex-1 min-w-0">
        <SearchBar
          :model-value="displayQuery"
          :placeholder="placeholder"
          variant="page"
          active-border
          readonly
          @click-input="emit('clickSearch')"
        />
      </div>

      <!-- Notification Bell -->
      <button
        type="button"
        class="p-1.5 text-text hover:text-primary rounded-lg relative cursor-pointer shrink-0"
        aria-label="Notifikasi"
        @click="emit('openNotifications')"
      >
        <Bell class="w-[22px] h-[22px]" />
      </button>

      <!-- Shopping Cart -->
      <button
        type="button"
        class="p-1.5 text-text hover:text-primary rounded-lg relative cursor-pointer shrink-0"
        aria-label="Keranjang Belanja"
        @click="emit('openCart')"
      >
        <ShoppingCart class="w-[22px] h-[22px]" />
        <span
          v-if="cartCount > 0"
          class="absolute top-0.5 right-0.5 bg-primary text-white text-[9px] font-bold min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center"
        >
          {{ cartCount > 9 ? '9+' : cartCount }}
        </span>
      </button>
    </div>

    <!-- Row 2: 2-Column Tabs: Produk | Toko -->
    <div class="grid grid-cols-2 border-b border-border bg-white max-w-[1400px] mx-auto">
      <button
        type="button"
        class="py-3 text-center font-outfit text-sm font-medium transition-colors relative cursor-pointer"
        :class="activeTab === 'product' ? 'text-primary font-semibold' : 'text-text-muted hover:text-text'"
        @click="emit('changeTab', 'product')"
      >
        <span>Produk</span>
        <span
          v-if="activeTab === 'product'"
          class="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
        />
      </button>

      <button
        type="button"
        class="py-3 text-center font-outfit text-sm font-medium transition-colors relative cursor-pointer"
        :class="activeTab === 'store' ? 'text-primary font-semibold' : 'text-text-muted hover:text-text'"
        @click="emit('changeTab', 'store')"
      >
        <span>Toko</span>
        <span
          v-if="activeTab === 'store'"
          class="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Bell, ShoppingCart } from 'lucide-vue-next'
import SearchBar from './SearchBar.vue'

interface SearchResultHeaderProps {
  displayQuery?: string
  placeholder?: string
  activeTab?: 'product' | 'store'
  cartCount?: number
}

withDefaults(defineProps<SearchResultHeaderProps>(), {
  displayQuery: '',
  placeholder: 'Cari di BekasKu',
  activeTab: 'product',
  cartCount: 0,
})

const emit = defineEmits<{
  back: []
  clickSearch: []
  changeTab: [tab: 'product' | 'store']
  openNotifications: []
  openCart: []
}>()
</script>
