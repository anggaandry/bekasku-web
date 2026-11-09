<script setup lang="ts">
import {
  X,
  Copy,
  Check,
  ShoppingBag,
  Store,
  ArrowUpRight,
  Landmark,
  Banknote,
  Wallet,
  Headset,
  ChevronRight,
} from 'lucide-vue-next'
import type { BalanceMutation } from '~/types/balance'
import { formatRupiah } from '~/utils/format'
import {
  getMutationStatusBadge,
  getMutationTypeLabel,
} from '~/composables/useBalance'
import { useHelpChatStore } from '~/stores/helpChat'

const props = defineProps<{
  modelValue: boolean
  item: BalanceMutation | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

const isCopied = ref(false)

async function copyId(id?: string) {
  if (!id) return
  try {
    await navigator.clipboard.writeText(id)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch {
    // fallback
  }
}

const isIncome = computed(() => ((props.item?.total || 0) > 0))

const statusBadge = computed(() => getMutationStatusBadge(props.item))

const typeLabel = computed(() => getMutationTypeLabel(props.item?.type))

const iconConfig = computed(() => {
  const type = props.item?.type ?? 0
  const total = props.item?.total ?? 0
  const isPos = total > 0

  let icon = Wallet
  switch (type) {
    case 0:
    case 1:
      icon = ShoppingBag
      break
    case 2:
      icon = Store
      break
    case 3:
      icon = ArrowUpRight
      break
    case 4:
    case 5:
      icon = Landmark
      break
    case 6:
      icon = Banknote
      break
    default:
      icon = Wallet
  }

  return {
    icon,
    bg: isPos ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary',
  }
})

const helpChatStore = useHelpChatStore()

function openCsHelp() {
  const id = props.item?.id || '-'
  const title = props.item?.title || '-'
  const total = props.item ? formatRupiah(Math.abs(props.item.total)) : '-'
  close()
  helpChatStore.openHelpChat({
    topic: 'balance',
    referenceId: id !== '-' ? id : undefined,
    referenceTitle: title !== '-' ? title : 'Mutasi Saldo',
    initialMessage: `Halo Tim CS BekasKu, saya butuh bantuan terkait transaksi saldo "${title}" (ID: ${id}, Nominal: ${total}).`,
  })
}

// Lock scroll
watch(
  () => props.modelValue,
  (open) => {
    if (import.meta.client) {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }
)

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue && item"
        class="fixed inset-0 z-[85] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
        @click.self="close"
      >
        <div
          class="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        >
          <!-- Drag Handle (Mobile) -->
          <div class="flex justify-center mb-3 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-border" />
          </div>

          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-3 border-b border-border/80 shrink-0">
            <h3 class="text-base sm:text-lg font-bold text-text">
              Detail Transaksi
            </h3>
            <button
              type="button"
              class="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text-muted hover:text-text transition-colors cursor-pointer"
              @click="close"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Scrollable Body -->
          <div class="flex-1 overflow-y-auto py-4 space-y-4">
            <!-- Hero Card: Icon + Nominal + Status -->
            <div
              class="rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center border"
              :class="
                isIncome
                  ? 'bg-emerald-50/70 border-emerald-200/60'
                  : 'bg-surface-2 border-border/80'
              "
            >
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                :class="iconConfig.bg"
              >
                <component :is="iconConfig.icon" class="w-6 h-6" />
              </div>

              <div
                class="text-2xl sm:text-3xl font-bold tracking-tight"
                :class="isIncome ? 'text-emerald-700' : 'text-text'"
              >
                {{ isIncome ? '+' : '-' }}{{ formatRupiah(Math.abs(item.total || 0)) }}
              </div>

              <div class="mt-2.5">
                <span
                  class="inline-block px-3 py-1 rounded-md text-xs font-bold border"
                  :class="statusBadge.bg"
                >
                  {{ statusBadge.text }}
                </span>
              </div>
            </div>

            <!-- Detail Information Card -->
            <div class="bg-white rounded-2xl border border-border/80 p-4 space-y-3 divide-y divide-border/60">
              <!-- Transaksi -->
              <div class="flex items-start justify-between gap-3 text-xs sm:text-sm">
                <span class="text-text-muted shrink-0">Transaksi</span>
                <span class="font-bold text-text text-right">{{ item.title || '-' }}</span>
              </div>

              <!-- Kategori -->
              <div class="pt-3 flex items-start justify-between gap-3 text-xs sm:text-sm">
                <span class="text-text-muted shrink-0">Kategori</span>
                <span class="font-medium text-text text-right">{{ typeLabel }}</span>
              </div>

              <!-- Waktu -->
              <div class="pt-3 flex items-start justify-between gap-3 text-xs sm:text-sm">
                <span class="text-text-muted shrink-0">Waktu</span>
                <span class="font-medium text-text text-right">{{ item.time || '-' }}</span>
              </div>

              <!-- ID Transaksi -->
              <div
                v-if="item.id"
                class="pt-3 flex items-center justify-between gap-3 text-xs sm:text-sm"
              >
                <span class="text-text-muted shrink-0">ID Transaksi</span>
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="font-mono text-xs text-text truncate max-w-[160px]">{{ item.id }}</span>
                  <button
                    type="button"
                    class="p-1 rounded-md hover:bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer"
                    :title="isCopied ? 'Tersalin' : 'Salin ID'"
                    @click="copyId(item.id)"
                  >
                    <Check v-if="isCopied" class="w-3.5 h-3.5 text-emerald-600" />
                    <Copy v-else class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Keterangan -->
              <div
                v-if="item.description"
                class="pt-3 flex flex-col gap-1 text-xs sm:text-sm"
              >
                <span class="text-text-muted">Keterangan</span>
                <p class="text-text text-xs leading-relaxed bg-surface-2 p-2.5 rounded-xl border border-border/60">
                  {{ item.description }}
                </p>
              </div>
            </div>

            <!-- Hubungi CS Banner -->
            <button
              type="button"
              class="w-full p-3 rounded-2xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors flex items-center justify-between gap-3 text-left cursor-pointer group"
              @click="openCsHelp"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Headset class="w-4 h-4" />
                </div>
                <span class="text-xs sm:text-sm font-semibold text-primary">
                  Ada kendala dengan transaksi ini? Hubungi CS
                </span>
              </div>
              <ChevronRight class="w-4 h-4 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <!-- Bottom Action: Tutup -->
          <div class="pt-3 border-t border-border/80 shrink-0">
            <button
              type="button"
              class="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold font-outfit transition-colors cursor-pointer"
              @click="close"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

