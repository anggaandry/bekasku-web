<template>
  <Teleport to="body">
    <div
      v-if="notifications.length > 0"
      class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2 sm:p-0 font-outfit"
    >
      <TransitionGroup name="toast">
        <div
          v-for="item in notifications"
          :key="item.id"
          class="pointer-events-auto rounded-xl p-3.5 shadow-lg border flex items-start gap-3 bg-white text-xs leading-relaxed"
          :class="{
            'border-green-200 text-green-900': item.type === 'success',
            'border-red-200 text-red-900': item.type === 'error',
            'border-amber-200 text-amber-900': item.type === 'warning',
            'border-border text-text': item.type === 'info',
          }"
        >
          <div class="shrink-0 mt-0.5">
            <CheckCircle2 v-if="item.type === 'success'" class="w-4 h-4 text-green-600" aria-hidden="true" />
            <AlertCircle v-else-if="item.type === 'error'" class="w-4 h-4 text-red-600" aria-hidden="true" />
            <AlertTriangle v-else-if="item.type === 'warning'" class="w-4 h-4 text-amber-600" aria-hidden="true" />
            <Info v-else class="w-4 h-4 text-primary" aria-hidden="true" />
          </div>

          <div class="flex-1 font-medium text-text">
            {{ item.message }}
          </div>

          <button
            type="button"
            class="text-text-muted hover:text-text cursor-pointer shrink-0 -mr-1 -mt-0.5 p-1"
            aria-label="Tutup pemberitahuan"
            @click="dismissNotification(item.id)"
          >
            <X class="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useNotification } from '~/composables/useNotification'

const { notifications, dismissNotification } = useNotification()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>

