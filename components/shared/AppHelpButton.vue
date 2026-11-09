<script setup lang="ts">
import { Headset } from 'lucide-vue-next'
import { useHelpChatStore } from '~/stores/helpChat'
import type { HelpCenterTopic } from '~/types/help'

const props = withDefaults(
  defineProps<{
    tooltip?: string
    topic?: HelpCenterTopic
    referenceId?: string
    referenceTitle?: string
    initialMessage?: string
    variant?: 'default' | 'primary'
    openPortal?: boolean
  }>(),
  {
    tooltip: 'Bantuan BekasKu Center',
    topic: 'general',
    variant: 'default',
    openPortal: false,
  },
)

const helpChatStore = useHelpChatStore()

function handleClick() {
  if (props.openPortal) {
    navigateTo('/help')
    return
  }
  helpChatStore.openHelpChat({
    topic: props.topic,
    referenceId: props.referenceId,
    referenceTitle: props.referenceTitle,
    initialMessage: props.initialMessage,
  })
}
</script>

<template>
  <button
    type="button"
    :title="tooltip"
    :aria-label="tooltip"
    class="min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] w-11 h-11 md:w-9 md:h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    :class="
      variant === 'primary'
        ? 'bg-white/15 hover:bg-white/25 border-white/25 text-white'
        : 'bg-surface-2 hover:bg-surface border-border text-text hover:text-primary'
    "
    @click="handleClick"
  >
    <Headset class="w-4.5 h-4.5 stroke-[2]" aria-hidden="true" />
  </button>
</template>

