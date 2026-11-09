<template>
  <header
    class="sticky top-0 z-30 bg-surface border-b border-border/60 px-3 py-2 flex items-center gap-2 md:hidden"
  >
    <!-- Back Button -->
    <button
      type="button"
      class="p-1.5 -ml-1 text-text hover:text-primary transition-colors cursor-pointer shrink-0"
      aria-label="Kembali"
      @click="handleBack"
    >
      <ArrowLeft class="w-5 h-5" />
    </button>

    <!-- Search Input in Store (Pill #F1F5F9, rounded-full, 38px height - matching mobile V3 L68-124) -->
    <div class="flex-1 min-w-0">
      <div
        class="h-[38px] bg-[#F1F5F9] rounded-full flex items-center px-3 gap-2 border border-transparent focus-within:border-primary/40 focus-within:bg-white transition-all"
      >
        <Search class="w-4 h-4 text-text-subtle shrink-0" />
        <input
          v-model="internalQuery"
          type="search"
          :placeholder="placeholderText"
          class="w-full bg-transparent text-[13.5px] font-outfit text-text placeholder:text-text-subtle outline-none truncate"
          @input="onInput"
          @keydown.enter="onSubmit"
        />
        <button
          v-if="internalQuery"
          type="button"
          class="w-4 h-4 rounded-full bg-text-subtle/50 flex items-center justify-center shrink-0 hover:bg-text-subtle transition-colors"
          aria-label="Hapus pencarian"
          @click="onClear"
        >
          <X class="w-2.5 h-2.5 text-white" />
        </button>
      </div>
    </div>

    <!-- Shopping Cart Button with Badge (matching mobile V3 L137-147) -->
    <button
      type="button"
      class="p-1.5 text-text hover:text-primary relative transition-colors cursor-pointer shrink-0"
      aria-label="Keranjang Belanja"
      @click="$emit('cart-click')"
    >
      <ShoppingCart class="w-5 h-5" />
      <span
        v-if="cartCount > 0"
        class="absolute top-0.5 right-0.5 bg-primary text-white text-[9px] font-bold min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center"
      >
        {{ cartCount > 9 ? '9+' : cartCount }}
      </span>
    </button>

    <!-- More Options Vertical Ellipsis (matching mobile V3 L148-152) -->
    <button
      type="button"
      class="p-1.5 -mr-1 text-text hover:text-primary transition-colors cursor-pointer shrink-0"
      aria-label="Menu Opsi"
      @click="$emit('more-click')"
    >
      <MoreVertical class="w-5 h-5" />
    </button>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  Search,
  X,
  ShoppingCart,
  MoreVertical,
} from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    sellerName?: string
    modelValue?: string
    cartCount?: number
  }>(),
  {
    sellerName: '',
    modelValue: '',
    cartCount: 0,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'search', val: string): void
  (e: 'cart-click'): void
  (e: 'more-click'): void
}>()

const router = useRouter()
const internalQuery = ref(props.modelValue || '')

watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined && val !== internalQuery.value) {
      internalQuery.value = val
    }
  }
)

const placeholderText = computed(() => {
  return props.sellerName ? `Cari di ${props.sellerName}` : 'Cari di toko ini'
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onInput() {
  emit('update:modelValue', internalQuery.value)
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', internalQuery.value)
  }, 400)
}

function onSubmit() {
  if (debounceTimer) clearTimeout(debounceTimer)
  emit('search', internalQuery.value)
}

function onClear() {
  internalQuery.value = ''
  emit('update:modelValue', '')
  emit('search', '')
}

function handleBack() {
  if (process.client && window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>
