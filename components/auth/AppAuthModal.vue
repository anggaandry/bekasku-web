<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { useAuthModal } from '~/composables/useAuthModal'
import AuthUnifiedCard from '~/components/auth/AuthUnifiedCard.vue'

const authModal = useAuthModal()

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && authModal.isOpen.value) {
    authModal.closeModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="auth-modal">
      <div
        v-if="authModal.isOpen.value"
        class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Autentikasi Akun BekasKu"
        @click.self="authModal.closeModal()"
      >
        <div class="auth-modal-panel w-full flex justify-center">
          <AuthUnifiedCard show-close-button @close="authModal.closeModal()" />
        </div>
      </div>
    </Transition>

    <Transition name="auth-modal">
      <div
        v-if="authModal.isReloading.value"
        class="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        role="status"
        aria-live="polite"
      >
        <div class="bg-white rounded-2xl shadow-2xl border border-border px-7 py-6 max-w-xs w-full flex flex-col items-center text-center">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-primary mb-3.5">
            <Loader2 class="w-6 h-6 animate-spin" />
          </div>
          <p class="text-sm font-bold text-text font-outfit">
            {{ authModal.reloadingTitle.value || 'Memproses...' }}
          </p>
          <p class="text-xs text-text-muted mt-1 leading-relaxed">
            {{ authModal.reloadingSubtitle.value || 'Mohon tunggu sebentar...' }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.auth-modal-enter-active,
.auth-modal-leave-active {
  transition: opacity 0.2s ease;
}
.auth-modal-enter-active .auth-modal-panel,
.auth-modal-leave-active .auth-modal-panel {
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.auth-modal-enter-from,
.auth-modal-leave-to {
  opacity: 0;
}
.auth-modal-enter-from .auth-modal-panel,
.auth-modal-leave-to .auth-modal-panel {
  transform: translateY(100%);
}
@media (min-width: 640px) {
  .auth-modal-enter-from .auth-modal-panel,
  .auth-modal-leave-to .auth-modal-panel {
    transform: scale(0.96);
  }
}
</style>

