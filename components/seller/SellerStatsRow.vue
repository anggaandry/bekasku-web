<template>
  <div :class="layout === 'sidebar' ? 'p-0' : 'px-4 py-2 md:px-0'">
    <!-- 1. Sidebar Vertical List Layout -->
    <div v-if="layout === 'sidebar'" class="space-y-2.5 text-xs font-outfit text-text-muted">
      <div v-if="locationText" class="flex items-center gap-2.5">
        <MapPin class="w-4 h-4 text-text-muted shrink-0" />
        <span class="truncate">{{ locationText }}</span>
      </div>

      <div v-if="hasChatReply" class="flex items-center gap-2.5">
        <MessageSquare class="w-4 h-4 text-text-muted shrink-0" />
        <span>{{ chatReplyText }} Chat Dibalas</span>
      </div>

      <div v-if="hasTotalSold" class="flex items-center gap-2.5">
        <Box class="w-4 h-4 text-text-muted shrink-0" />
        <span>{{ totalSoldText }} barang terjual</span>
      </div>

      <div v-if="seller.last_active" class="flex items-center gap-2.5">
        <Store class="w-4 h-4 text-text-muted shrink-0" />
        <span>{{ seller.last_active }}</span>
      </div>
    </div>

    <!-- 2. Default Horizontal Scrollable Row Layout (Mobile & Standard) -->
    <div
      v-else
      class="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 text-xs font-outfit whitespace-nowrap"
    >
      <!-- Location -->
      <div v-if="locationText" class="flex items-center gap-1 shrink-0">
        <MapPin class="w-3.5 h-3.5 text-text-muted shrink-0" />
        <span class="text-[12px] text-text-muted truncate max-w-[200px]">{{ locationText }}</span>
      </div>

      <!-- Separator -->
      <span
        v-if="locationText && (hasChatReply || hasTotalSold || seller.last_active)"
        class="w-[3px] h-[3px] rounded-full bg-text-subtle shrink-0 mx-1.5"
      />

      <!-- Chat Response Rate -->
      <div v-if="hasChatReply" class="flex items-center gap-1 shrink-0">
        <MessageSquare class="w-3.5 h-3.5 text-text-muted shrink-0" />
        <span class="text-[12px] text-text-muted">{{ chatReplyText }} Chat Dibalas</span>
      </div>

      <!-- Separator -->
      <span
        v-if="hasChatReply && (hasTotalSold || seller.last_active)"
        class="w-[3px] h-[3px] rounded-full bg-text-subtle shrink-0 mx-1.5"
      />

      <!-- Total Sold -->
      <div v-if="hasTotalSold" class="flex items-center gap-1 shrink-0">
        <Box class="w-3.5 h-3.5 text-text-muted shrink-0" />
        <span class="text-[12px] text-text-muted">{{ totalSoldText }} barang terjual</span>
      </div>

      <!-- Separator -->
      <span
        v-if="hasTotalSold && seller.last_active"
        class="w-[3px] h-[3px] rounded-full bg-text-subtle shrink-0 mx-1.5"
      />

      <!-- Last Active -->
      <div v-if="seller.last_active" class="flex items-center gap-1 shrink-0">
        <Store class="w-3.5 h-3.5 text-text-muted shrink-0" />
        <span class="text-[12px] text-text-muted">{{ seller.last_active }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MapPin, MessageSquare, Box, Store } from 'lucide-vue-next'
import type { SellerInfo } from '~/types/seller'

const props = withDefaults(
  defineProps<{
    seller: SellerInfo
    layout?: 'default' | 'sidebar'
  }>(),
  {
    layout: 'default',
  }
)

const locationText = computed(() => {
  return props.seller.location || ''
})

const hasChatReply = computed(() => {
  return props.seller.percent_chat_reply !== undefined && props.seller.percent_chat_reply !== null
})

const chatReplyText = computed(() => {
  const rate = props.seller.percent_chat_reply
  return `${rate ?? 0}%`
})

const hasTotalSold = computed(() => {
  const sold = props.seller.total_sold
  return sold !== undefined && sold !== null && Number(sold) > 0
})

const totalSoldText = computed(() => {
  const sold = Number(props.seller.total_sold || 0)
  if (sold >= 100) return '100+'
  if (sold >= 50) return '50+'
  if (sold >= 10) return '10+'
  return sold.toString()
})
</script>
