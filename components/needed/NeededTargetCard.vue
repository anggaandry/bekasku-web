<template>
  <div class="bg-white rounded-2xl border border-border p-4 md:p-5 shadow-2xs space-y-3">
    <div class="flex items-start gap-3.5">
      <div class="w-12 h-12 rounded-full overflow-hidden bg-surface-2 border border-border/80 shrink-0 flex items-center justify-center">
        <img
          v-if="target.seller_avatar"
          :src="sanitizeMediaUrl(target.seller_avatar)"
          :alt="target.seller_name || 'Pembuat Iklan'"
          width="48"
          height="48"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <User v-else class="w-6 h-6 text-text-subtle" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold font-outfit">
            Dibutuhkan
          </span>
          <span class="text-xs text-text-muted font-outfit truncate">
            Iklan oleh <strong class="text-text font-semibold">{{ target.seller_name || 'Pengguna BekasKu' }}</strong>
          </span>
        </div>

        <h2 class="text-sm md:text-base font-bold text-text font-outfit mt-1 line-clamp-2">
          {{ target.needed_title || 'Iklan Barang Dibutuhkan' }}
        </h2>
      </div>
    </div>

    <div class="pt-2 border-t border-border/50 flex items-center gap-2 text-xs text-text-muted font-outfit">
      <Info class="w-4 h-4 text-primary shrink-0" />
      <span>Pilih salah satu produk aktif dari katalog tokomu di bawah ini untuk ditawarkan.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Info } from 'lucide-vue-next'
import type { NeededOfferTargetInfo } from '~/types/needed'
import { sanitizeMediaUrl } from '~/utils/media'

defineProps<{
  target: NeededOfferTargetInfo
}>()
</script>
