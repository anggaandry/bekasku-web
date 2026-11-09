<script setup lang="ts">
import { ArrowLeft, Search, Share2, ShoppingCart } from 'lucide-vue-next'

const props = defineProps<{
  title?: string
  cartCount?: number
  isLoggedIn?: boolean
}>()

const emit = defineEmits<{
  (e: 'cart-click'): void
}>()

const router = useRouter()
const copied = ref(false)

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function goSearch() {
  router.push('/search')
}

async function handleShare() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.title || 'Lihat produk di BekasKu',
        url: window.location.href,
      })
      return
    } catch {
      // User cancelled or unsupported
    }
  }

  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Ignore
  }
}
</script>

<template>
  <header class="sticky top-0 z-30 w-full bg-white border-b border-border shadow-2xs transition-all">
    <div class="max-w-[1280px] mx-auto px-3.5 h-14 flex items-center justify-between gap-2">
      <!-- Back Button -->
      <button
        type="button"
        @click="goBack"
        class="p-2 -ml-1.5 rounded-full text-text hover:bg-surface-2 transition-colors cursor-pointer"
        aria-label="Kembali"
      >
        <ArrowLeft class="w-6 h-6" />
      </button>

      <!-- Action Icons: Search, Share, Cart (Matches DetailSliverAppBar) -->
      <div class="flex items-center gap-1">
        <!-- Search Icon -->
        <button
          type="button"
          @click="goSearch"
          class="p-2 rounded-full text-text hover:bg-surface-2 transition-colors cursor-pointer"
          aria-label="Cari Produk"
        >
          <Search class="w-[22px] h-[22px]" />
        </button>

        <!-- Share Icon -->
        <button
          type="button"
          @click="handleShare"
          class="p-2 rounded-full text-text hover:bg-surface-2 transition-colors cursor-pointer relative"
          aria-label="Bagikan Produk"
        >
          <Share2 class="w-[22px] h-[22px]" />
          <span
            v-if="copied"
            class="absolute -bottom-8 right-0 px-2 py-1 bg-dark text-white text-[11px] rounded-md shadow-md whitespace-nowrap"
          >
            Tautan disalin!
          </span>
        </button>

        <!-- Cart Icon with Badge -->
        <button
          type="button"
          @click="emit('cart-click')"
          class="p-2 rounded-full text-text hover:bg-surface-2 transition-colors relative cursor-pointer"
          aria-label="Keranjang Belanja"
        >
          <ShoppingCart class="w-[22px] h-[22px]" />
          <span
            v-if="cartCount && cartCount > 0"
            class="absolute top-1 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center leading-none"
          >
            {{ cartCount > 99 ? '99+' : cartCount }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>
