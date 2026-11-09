<script setup lang="ts">
import { Headphones, ChevronRight } from 'lucide-vue-next'
import { BEKASKU_CENTER_MSG_ORDER_QUESTION } from '~/utils/constants'
import { useHelpChatStore } from '~/stores/helpChat'

const helpChatStore = useHelpChatStore()

function handleOpenSupport() {
  helpChatStore.openHelpChat({
    topic: 'transaction',
    referenceTitle: 'Pertanyaan Pesanan',
    initialMessage: BEKASKU_CENTER_MSG_ORDER_QUESTION,
  })
}
</script>

<template>
  <button
    type="button"
    class="w-full text-left bg-white rounded-2xl border border-border/80 p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-primary/50 transition-colors shadow-2xs"
    @click="handleOpenSupport"
  >
    <div class="flex items-center gap-2.5 min-w-0">
      <Headphones class="w-4 h-4 text-primary shrink-0" />
      <span class="font-outfit font-medium text-xs text-primary leading-snug">
        Punya pertanyaan seputar pesanan ini? Hubungi BekasKu Center
      </span>
    </div>
    <ChevronRight class="w-4 h-4 text-primary shrink-0" />
  </button>
</template>

