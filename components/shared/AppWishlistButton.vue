<script setup lang="ts">
import { Heart } from 'lucide-vue-next'
import { useWishlist } from '~/composables/useWishlist'
import { useAuthStore } from '~/stores/auth'

const props = withDefaults(
  defineProps<{
    productId: string
    active?: boolean
    size?: 'sm' | 'md'
  }>(),
  {
    active: false,
    size: 'sm',
  }
)

const emit = defineEmits<{
  toggled: [isWishlisted: boolean]
}>()

const authStore = useAuthStore()
const { toggleWishlist, isWishlisted } = useWishlist()
const toggling = ref(false)

const isActive = computed(() => {
  return props.active || isWishlisted(props.productId)
})

async function handleClick(e: Event) {
  e.stopPropagation()
  e.preventDefault()

  if (!authStore.isLoggedIn) {
    navigateTo('/login?redirect=' + encodeURIComponent(useRoute().fullPath))
    return
  }

  if (toggling.value || !props.productId) return
  toggling.value = true

  const res = await toggleWishlist(props.productId)
  toggling.value = false

  if (res.success) {
    emit('toggled', !res.isDeleted)
  }
}
</script>

<template>
  <button
    type="button"
    class="rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
    :class="[
      props.size === 'md' ? 'w-9 h-9' : 'w-7 h-7',
      isActive
        ? 'bg-primary text-white shadow-primary/20'
        : 'bg-white/90 backdrop-blur-2xs text-text-subtle hover:text-primary hover:bg-white border border-border/80'
    ]"
    :aria-label="isActive ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'"
    @click="handleClick"
  >
    <Heart
      class="transition-transform"
      :class="[
        props.size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5',
        isActive ? 'fill-current scale-105' : ''
      ]"
    />
  </button>
</template>

