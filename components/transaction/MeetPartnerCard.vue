<script setup lang="ts">
import { Handshake, MapPin, Star } from 'lucide-vue-next'
import { sanitizeMediaUrl } from '~/utils/media'

const props = defineProps<{
  name: string
  avatar?: string
  city?: string
  rate?: number
  isSeller: boolean
}>()

const initial = computed(() => {
  return props.name?.trim() ? props.name.trim().charAt(0).toUpperCase() : 'U'
})

const partnerLabel = computed(() => {
  return props.isSeller ? 'Pembeli' : 'Penjual'
})
</script>

<template>
  <div class="bg-white rounded-2xl p-4 border border-border flex items-center justify-between gap-3 shadow-2xs">
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-border/80 bg-primary/10 flex items-center justify-center">
        <NuxtImg
          v-if="avatar"
          :src="sanitizeMediaUrl(avatar)"
          :alt="name || partnerLabel"
          width="44"
          height="44"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <span v-else class="font-outfit font-bold text-base text-primary">
          {{ initial }}
        </span>
      </div>

      <div class="min-w-0">
        <h4 class="font-outfit font-bold text-sm sm:text-base text-text truncate">
          {{ name || partnerLabel }}
        </h4>
        <div v-if="city" class="flex items-center gap-1 text-xs text-text-muted mt-0.5">
          <MapPin class="w-3.5 h-3.5 text-text-subtle shrink-0" />
          <span class="truncate">{{ city }}</span>
        </div>
        <div v-else-if="!isSeller && rate && rate > 0" class="flex items-center gap-1 text-xs text-text font-semibold mt-0.5">
          <Star class="w-3.5 h-3.5 text-warning fill-warning shrink-0" />
          <span>{{ rate }}</span>
        </div>
        <div v-else class="text-xs text-text-muted mt-0.5">
          {{ partnerLabel }}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
      <Handshake class="w-3.5 h-3.5 text-primary" />
      <span class="font-outfit font-semibold text-xs text-primary">
        Pay & Pick
      </span>
    </div>
  </div>
</template>

