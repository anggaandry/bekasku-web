<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, Star, Zap, Check, ChevronDown, Clock } from 'lucide-vue-next'
import type { PromotionType, PromotionPackage } from '~/types/promotion'
import { formatRupiah } from '~/utils/format'

const props = defineProps<{
  type: PromotionType
  quota: number
  isSelected: boolean
  useQuotaMode: boolean
  selectedPackage: PromotionPackage | null
  cooldownSeconds?: number
  isFeatureActive?: boolean
  featureActiveUntil?: string | null
}>()

const emit = defineEmits<{
  (e: 'select-type', type: PromotionType): void
  (e: 'toggle-quota', useQuota: boolean): void
  (e: 'open-package-modal', type: PromotionType): void
}>()

const meta = computed(() => {
  switch (props.type) {
    case 'spotlight':
      return {
        title: 'Spotlight',
        badge: 'Maks 2×',
        desc: 'Spotlight meningkatkan visibilitas profil dan iklan kamu dengan ukuran 2x lebih besar dan posisi strategis di beranda.',
        icon: Zap,
        accentText: 'text-indigo-700',
        bgIcon: 'bg-indigo-50 text-indigo-600',
        borderActive: 'border-indigo-600 ring-2 ring-indigo-600/20',
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      }
    case 'sundul':
      return {
        title: 'Sundul',
        badge: 'Populer',
        desc: 'Sundul membuat iklan naik ke atas seperti baru, lebih mudah dilihat, dan menarik pembeli di hasil pencarian.',
        icon: TrendingUp,
        accentText: 'text-rose-700',
        bgIcon: 'bg-rose-50 text-primary',
        borderActive: 'border-primary ring-2 ring-primary/20',
        badgeBg: 'bg-rose-50 text-primary border-rose-200',
      }
    case 'highlight':
    default:
      return {
        title: 'Highlight',
        badge: 'Terlaris',
        desc: 'Aktifkan Highlight agar iklan kamu tampil di posisi teratas. Lebih terlihat, lebih banyak dilirik dan cepat terjual.',
        icon: Star,
        accentText: 'text-amber-700',
        bgIcon: 'bg-amber-50 text-amber-600',
        borderActive: 'border-amber-600 ring-2 ring-amber-600/20',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      }
  }
})

const cooldownText = computed(() => {
  if (props.type !== 'sundul' || !props.cooldownSeconds || props.cooldownSeconds <= 0) return ''
  const h = Math.floor(props.cooldownSeconds / 3600)
  const m = Math.floor((props.cooldownSeconds % 3600) / 60)
  return h > 0 ? `Cooldown ${h}j ${m}m` : `Cooldown ${m}m`
})

const expiryText = computed(() => {
  if (!props.featureActiveUntil) return ''
  try {
    const d = new Date(props.featureActiveUntil)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
})
</script>

<template>
  <div
    class="bg-white rounded-2xl border transition-all p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
    :class="[
      props.isSelected
        ? meta.borderActive + ' shadow-sm'
        : 'border-border hover:border-border-light hover:shadow-2xs'
    ]"
    @click="emit('select-type', props.type)"
  >
    <!-- Top Row: Icon + Title + Radio -->
    <div>
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0', meta.bgIcon]">
            <component :is="meta.icon" class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-base font-bold font-outfit text-text">
                {{ meta.title }}
              </h4>
              <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border', meta.badgeBg]">
                {{ meta.badge }}
              </span>
            </div>
            <div class="text-[11px] text-text-muted mt-0.5">
              Quota: <span class="font-semibold text-text">{{ props.quota }}</span>
            </div>
          </div>
        </div>

        <!-- Radio Button -->
        <div
          class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0"
          :class="[
            props.isSelected ? 'border-primary bg-primary text-white' : 'border-border bg-white'
          ]"
        >
          <div v-if="props.isSelected" class="w-2 h-2 rounded-full bg-white" />
        </div>
      </div>

      <!-- Description -->
      <p class="text-xs text-text-muted leading-relaxed mt-3">
        {{ meta.desc }}
      </p>

      <!-- Active / Cooldown Status Pill -->
      <div v-if="cooldownText || props.isFeatureActive" class="mt-3 flex items-center gap-1.5">
        <span
          v-if="cooldownText"
          class="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-lg"
        >
          <Clock class="w-3 h-3 text-cyan-600" />
          {{ cooldownText }}
        </span>
        <span
          v-else-if="props.isFeatureActive"
          class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg"
        >
          <Check class="w-3 h-3 text-emerald-600" />
          Aktif s.d. {{ expiryText }}
        </span>
      </div>
    </div>

    <!-- Bottom Actions: Quota Toggle or Package Selection -->
    <div class="pt-4 mt-4 border-t border-border-light space-y-2.5">
      <!-- Option 1: Use Free Quota -->
      <div
        v-if="props.quota > 0"
        class="flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors"
        :class="[
          props.isSelected && props.useQuotaMode
            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-semibold'
            : 'border-border-light bg-surface-2 hover:bg-surface-2/80 text-text'
        ]"
        @click.stop="emit('toggle-quota', true)"
      >
        <span class="flex items-center gap-1.5">
          <Check v-if="props.isSelected && props.useQuotaMode" class="w-3.5 h-3.5 text-emerald-600" />
          Gunakan Kuota (Gratis)
        </span>
        <span class="text-[11px] font-medium text-emerald-700">
          Sisa {{ props.quota }}
        </span>
      </div>

      <!-- Option 2: Choose / Buy Package -->
      <button
        type="button"
        class="w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors"
        :class="[
          props.isSelected && !props.useQuotaMode
            ? 'border-primary bg-primary/5 text-primary font-semibold'
            : 'border-border-light bg-white hover:bg-surface-2 text-text'
        ]"
        @click.stop="emit('open-package-modal', props.type)"
      >
        <div class="text-left min-w-0 flex-1">
          <div class="truncate text-[11px] text-text-muted">
            {{ props.selectedPackage ? props.selectedPackage.name || `Paket ${meta.title}` : `Beli Fitur ${meta.title}` }}
          </div>
          <div class="text-xs font-bold text-text">
            {{ props.selectedPackage ? formatRupiah(props.selectedPackage.price) : 'Lihat Detail Paket' }}
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0 ml-1.5">
          <span class="text-[10px] font-semibold text-primary underline">Ubah</span>
          <ChevronDown class="w-3.5 h-3.5 text-text-muted" />
        </div>
      </button>
    </div>
  </div>
</template>
