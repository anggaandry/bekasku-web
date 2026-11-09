<script setup lang="ts">
import { ArrowLeft, ShoppingCart, Search, Loader2 } from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'

const props = defineProps<{
  modelValue: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: string]
  search: [val: string]
}>()

const cartStore = useCartStore()
const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/')
  }
}

function handleInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  emit('update:modelValue', val)
  emit('search', val)
}
</script>

<template>
  <div class="bg-white border-b border-border sticky top-0 z-30">
    <!-- Header Mobile Bar Sesuai Screenshot Gambar 1 & 2 -->
    <div class="md:hidden px-4 h-14 flex items-center justify-between gap-2.5">
      <button
        type="button"
        class="p-2 -ml-2 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
        aria-label="Kembali"
        @click="goBack"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>

      <h1 class="text-base font-bold text-text font-outfit flex-1 text-center pr-2">
        Wishlist
      </h1>

      <NuxtLink
        to="/cart"
        class="relative p-2 -mr-2 rounded-full hover:bg-surface-2 text-text transition-colors cursor-pointer"
        aria-label="Keranjang Belanja"
      >
        <ShoppingCart class="w-5 h-5" />
        <span
          v-if="cartStore.itemCount > 0"
          class="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center font-outfit"
        >
          {{ cartStore.itemCount > 9 ? '9+' : cartStore.itemCount }}
        </span>
      </NuxtLink>
    </div>

    <!-- Search Bar Sesuai Gambar 1 & 2 (Rounded 12px, Soft Border) -->
    <div class="px-4 pb-3 md:py-3.5 max-w-[1200px] mx-auto">
      <div class="relative flex items-center">
        <div class="absolute left-3.5 text-text-subtle flex items-center pointer-events-none">
          <Search class="w-4 h-4" />
        </div>

        <input
          id="wishlist-search"
          name="wishlist-search"
          aria-label="Cari di Wishlist"
          :value="props.modelValue"
          type="text"
          placeholder="Cari di Wishlist..."
          class="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-2 border border-border text-xs sm:text-sm text-text placeholder:text-text-subtle focus:outline-hidden focus:border-primary transition-colors font-outfit"
          @input="handleInput"
        />

        <div v-if="props.loading" class="absolute right-3.5 text-primary flex items-center">
          <Loader2 class="w-4 h-4 animate-spin" />
        </div>
      </div>
    </div>
  </div>
</template>
