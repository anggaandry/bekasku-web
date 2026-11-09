<script setup lang="ts">
import { TrendingUp, Star, Zap, Plus } from 'lucide-vue-next'
import type { PromotionQuota } from '~/types/promotion'

const props = defineProps<{
  quota: PromotionQuota
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'select-tab', tab: 'active' | 'products'): void
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-2xs">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border-light">
      <div>
        <h2 class="text-base sm:text-lg font-bold font-outfit text-text">
          Pusat Promosi &amp; Visibilitas
        </h2>
        <p class="text-xs text-text-muted mt-0.5">
          Tingkatkan penjualan produk bekas Anda dengan fitur promosi eksklusif
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-2xs"
        @click="emit('select-tab', 'products')"
      >
        <Plus class="w-3.5 h-3.5" />
        Promosikan Barang
      </button>
    </div>

    <!-- Quota 3 Grid Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <!-- Sundul Quota -->
      <div class="flex items-center gap-3 p-3 rounded-xl bg-cyan-50/70 border border-cyan-100">
        <div class="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
          <TrendingUp class="w-5 h-5" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[11px] font-medium text-cyan-800">
            Kuota Sundul
          </div>
          <div class="text-lg font-bold text-cyan-950 font-outfit">
            {{ props.loading ? '...' : props.quota.sundul_quota }} <span class="text-xs font-normal text-cyan-700">kali</span>
          </div>
        </div>
      </div>

      <!-- Highlight Quota -->
      <div class="flex items-center gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-100">
        <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
          <Star class="w-5 h-5" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[11px] font-medium text-amber-800">
            Kuota Highlight
          </div>
          <div class="text-lg font-bold text-amber-950 font-outfit">
            {{ props.loading ? '...' : props.quota.highlight_quota }} <span class="text-xs font-normal text-amber-700">hari</span>
          </div>
        </div>
      </div>

      <!-- Spotlight Quota -->
      <div class="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
        <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
          <Zap class="w-5 h-5" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[11px] font-medium text-indigo-800">
            Kuota Spotlight
          </div>
          <div class="text-lg font-bold text-indigo-950 font-outfit">
            {{ props.loading ? '...' : props.quota.spotlight_quota }} <span class="text-xs font-normal text-indigo-700">hari</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

