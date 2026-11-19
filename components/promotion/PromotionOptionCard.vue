<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, Activity, Megaphone, Check, Clock } from 'lucide-vue-next'
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
        desc: 'Spotlight meningkatkan visibilitas profil dan iklan kamu. Dengan ukuran 2x lebih besar dan posisi yang strategis.',
        icon: Megaphone,
      }
    case 'sundul':
      return {
        title: 'Sundul',
        desc: 'Sundul membuat iklan naik ke atas seperti baru, lebih mudah dilihat, dan menarik pembeli',
        icon: TrendingUp,
      }
    case 'highlight':
    default:
      return {
        title: 'Highlight',
        desc: 'Aktifkan Highlight agar iklan kamu tampil di posisi teratas. Lebih terlihat, lebih banyak dilirik dan cepat terjual.',
        icon: Activity,
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
    class="bg-white rounded-xl border transition-all p-4 flex flex-col justify-between cursor-pointer"
    :class="[
      props.isSelected
        ? 'border-primary bg-[#FFF9F9] shadow-2xs'
        : 'border-gray-200 hover:border-gray-300'
    ]"
    @click="emit('select-type', props.type)"
  >
    <div>
      <!-- Top Row: Soft Pink Icon Box + Title + Radio -->
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-lg bg-[#FCE8EA] text-gray-900 flex items-center justify-center shrink-0">
            <component :is="meta.icon" class="w-4.5 h-4.5" />
          </div>
          <h4 class="text-base font-bold font-outfit text-gray-900 truncate">
            {{ meta.title }}
          </h4>
        </div>

        <!-- Radio Circle -->
        <div
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0"
          :class="props.isSelected ? 'border-primary' : 'border-gray-300'"
        >
          <div v-if="props.isSelected" class="w-2.5 h-2.5 rounded-full bg-primary" />
        </div>
      </div>

      <!-- Description -->
      <p class="text-xs text-gray-500 leading-relaxed mt-3">
        {{ meta.desc }}
      </p>

      <!-- Selected Package / Status Pill (only when active/cooldown or package chosen) -->
      <div v-if="cooldownText || props.isFeatureActive || (props.isSelected && props.selectedPackage && !props.useQuotaMode)" class="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span
          v-if="cooldownText"
          class="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md"
        >
          <Clock class="w-3 h-3 text-cyan-600" />
          {{ cooldownText }}
        </span>
        <span
          v-else-if="props.isFeatureActive"
          class="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md"
        >
          <Check class="w-3 h-3 text-emerald-600" />
          Aktif s.d. {{ expiryText }}
        </span>
        <span
          v-if="props.isSelected && props.selectedPackage && !props.useQuotaMode"
          class="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-[#FCE8EA] px-2 py-0.5 rounded-md"
        >
          {{ props.selectedPackage.name || `Fitur ${meta.title}` }} · {{ formatRupiah(props.selectedPackage.price) }}
        </span>
      </div>
    </div>

    <!-- Bottom Row: Lihat Detail button (left) + Quota: N (right) -->
    <div class="mt-4 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition-colors cursor-pointer"
          @click.stop="emit('open-package-modal', props.type)"
        >
          Lihat Detail
        </button>

        <button
          v-if="props.quota > 0"
          type="button"
          class="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer"
          :class="props.isSelected && props.useQuotaMode ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'"
          @click.stop="emit('toggle-quota', true)"
        >
          Pakai Kuota
        </button>
      </div>

      <span class="text-xs text-gray-500 font-medium shrink-0">
        Quota: {{ props.quota }}
      </span>
    </div>
  </div>
</template>
