<script setup lang="ts">
import {
  ChevronRight,
  Plus,
  TrendingUp,
  Package,
  CheckCircle2,
  ShoppingBag,
  AlertCircle,
} from 'lucide-vue-next'
import type { MyCatalogCounts } from '~/types/catalog'

const props = defineProps<{
  counts: MyCatalogCounts
  selectedStatus: number
}>()

const emit = defineEmits<{
  (e: 'select-status', status: number): void
}>()
</script>

<template>
  <aside class="space-y-4 font-outfit" aria-label="Ringkasan Iklan Penjual">
    <!-- ── 1. Title & Action Card ────────────────────────────────────────────── -->
    <div class="bg-white p-5 rounded-2xl border border-border-light shadow-2xs space-y-4">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-1.5 text-xs text-text-muted" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-primary transition-colors">Beranda</NuxtLink>
        <ChevronRight class="w-3.5 h-3.5" aria-hidden="true" />
        <span class="text-text font-semibold">Iklan Saya</span>
      </nav>

      <!-- Title & Subtitle -->
      <div>
        <h1 class="text-xl font-bold text-text tracking-tight">
          Katalog Iklan Saya
        </h1>
        <p class="text-xs text-text-muted mt-1 leading-relaxed">
          Kelola inventaris jualan, pantau status postingan, dan sundul iklan Anda.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="space-y-2 pt-1 border-t border-border-light">
        <NuxtLink
          to="/post/sell"
          class="w-full px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>Pasang Iklan Baru</span>
        </NuxtLink>

        <NuxtLink
          to="/sundul"
          class="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 hover:bg-border-light border border-border-light text-text font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <TrendingUp class="w-4 h-4 text-primary" aria-hidden="true" />
          <span>Riwayat Sundul</span>
        </NuxtLink>
      </div>
    </div>

    <!-- ── 2. Stat Cards Stacked Vertically ──────────────────────────────────── -->
    <div class="bg-white p-4 rounded-2xl border border-border-light shadow-2xs space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-border-light">
        <span class="text-xs font-bold text-text uppercase tracking-wider">Statistik Iklan</span>
        <span class="text-[11px] text-text-subtle">Klik untuk filter</span>
      </div>

      <!-- 1. Total Iklan (Semua) -->
      <button
        type="button"
        @click="emit('select-status', 0)"
        class="w-full p-3.5 rounded-xl border transition-all text-left cursor-pointer group flex items-center justify-between"
        :class="selectedStatus === 0 ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-xs' : 'bg-surface-2/60 border-border-light hover:border-primary/40 hover:bg-white'"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Package class="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <p class="text-xs font-semibold text-text-muted">Total Iklan</p>
            <p class="text-lg font-bold text-text leading-tight mt-0.5">{{ counts.all }}</p>
          </div>
        </div>
        <span class="text-[11px] font-semibold text-primary">semua</span>
      </button>

      <!-- 2. Sedang Tayang (Aktif) -->
      <button
        type="button"
        @click="emit('select-status', 1)"
        class="w-full p-3.5 rounded-xl border transition-all text-left cursor-pointer group flex items-center justify-between"
        :class="selectedStatus === 1 ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs' : 'bg-surface-2/60 border-border-light hover:border-emerald-500/40 hover:bg-white'"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 class="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <p class="text-xs font-semibold text-text-muted">Sedang Tayang</p>
            <p class="text-lg font-bold text-text leading-tight mt-0.5">{{ counts.active }}</p>
          </div>
        </div>
        <span class="text-[11px] font-semibold text-emerald-600">aktif</span>
      </button>

      <!-- 3. Terjual -->
      <button
        type="button"
        @click="emit('select-status', 3)"
        class="w-full p-3.5 rounded-xl border transition-all text-left cursor-pointer group flex items-center justify-between"
        :class="selectedStatus === 3 ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-xs' : 'bg-surface-2/60 border-border-light hover:border-blue-500/40 hover:bg-white'"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag class="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <p class="text-xs font-semibold text-text-muted">Terjual</p>
            <p class="text-lg font-bold text-text leading-tight mt-0.5">{{ counts.sold }}</p>
          </div>
        </div>
        <span class="text-[11px] font-semibold text-blue-600">transaksi</span>
      </button>

      <!-- 4. Dibatalkan / Tolak -->
      <button
        type="button"
        @click="emit('select-status', 2)"
        class="w-full p-3.5 rounded-xl border transition-all text-left cursor-pointer group flex items-center justify-between"
        :class="selectedStatus === 2 ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20 shadow-xs' : 'bg-surface-2/60 border-border-light hover:border-amber-500/40 hover:bg-white'"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle class="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <p class="text-xs font-semibold text-text-muted">Dibatalkan / Tolak</p>
            <p class="text-lg font-bold text-text leading-tight mt-0.5">{{ counts.canceled }}</p>
          </div>
        </div>
        <span class="text-[11px] font-semibold text-amber-600">nonaktif</span>
      </button>
    </div>
  </aside>
</template>

