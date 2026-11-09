<script setup lang="ts">
import { useAuthModal } from '~/composables/useAuthModal'

/**
 * Backward-compatible bridge for guest-locked actions.
 * Immediately delegates any `v-model="showGuestModal"` trigger to the unified
 * 2-column Global Auth Modal (`AppAuthModal.vue`) via `useAuthModal()`.
 */
const props = defineProps<{
  modelValue: boolean
  featureTitle?: string
  message?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const authModal = useAuthModal()

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      authModal.openLogin({
        featureTitle: props.featureTitle,
        message: props.message,
      })
      nextTick(() => {
        emit('update:modelValue', false)
      })
    }
  },
  { immediate: true },
)
</script>

<template>
  <span class="guest-auth-bridge hidden" aria-hidden="true" />
</template>

<style scoped>
.guest-auth-bridge {
  display: none;
}
</style>
