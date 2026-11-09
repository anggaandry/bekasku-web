<script setup lang="ts">
import {
  Wallet,
  X,
  Eye,
  EyeOff,
  Clock,
  RotateCcw,
} from 'lucide-vue-next'
import { formatRupiah } from '~/utils/format'
import type { BalanceMutation } from '~/types/balance'
import BalanceMutationItem from '~/components/transaction/BalanceMutationItem.vue'
import { API_TRANSACTION_LIST } from '~/utils/constants'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const api = useApi()

const showBalance = ref(true)
const currentBalance = ref(0)
const isBalanceLoading = ref(false)

const filterType = ref(0)
const filterTime = ref(0)

const typeOptions = [
  { value: 0, label: 'Semua' },
  { value: 2, label: 'Penjualan' },
  { value: 1, label: 'Pembelian' },
  { value: 3, label: 'Pengembalian' },
]

const timeOptions = [
  { value: 0, label: 'Semua Waktu' },
  { value: 7, label: '7 Hari Terakhir' },
  { value: 14, label: '14 Hari Terakhir' },
  { value: 30, label: '30 Hari Terakhir' },
]

const historyList = ref<BalanceMutation[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const page = ref(1)
const hasNextPage = ref(false)
const errorMessage = ref('')

function handleClose() {
  emit('update:modelValue', false)
}

async function fetchBalance() {
  isBalanceLoading.value = true
  try {
    const res = await api.post<{
      result?: { balance?: number }
      balance?: number
    }>(API_TRANSACTION_LIST, {
      page: 1,
      type: 0,
      lang: 'id',
    })

    if (res?.result && typeof res.result.balance === 'number') {
      currentBalance.value = res.result.balance
    } else if (typeof res?.balance === 'number') {
      currentBalance.value = res.balance
    }
  } catch {
    // ignore
  } finally {
    isBalanceLoading.value = false
  }
}

async function fetchHistory(isRefresh = true) {
  if (isRefresh) {
    page.value = 1
    isLoading.value = true
    errorMessage.value = ''
    historyList.value = []
  } else {
    isLoadingMore.value = true
  }

  try {
    const body: Record<string, any> = {
      page: page.value,
      type: filterType.value,
      time: filterTime.value,
      lang: 'id',
    }

    const res = await api.post<{
      message?: string
      result?: {
        docs?: BalanceMutation[]
        hasNextPage?: boolean
        balance?: number
      }
      balance?: number
    }>('/balance/history', body)

    if (res?.result?.docs) {
      if (isRefresh) {
        historyList.value = res.result.docs
      } else {
        historyList.value.push(...res.result.docs)
      }
      hasNextPage.value = Boolean(res.result.hasNextPage)

      if (typeof res.result.balance === 'number') {
        currentBalance.value = res.result.balance
      }
    } else if (res?.message && res.message !== 'Success') {
      errorMessage.value = res.message
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'Gagal memuat riwayat mutasi'
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

function loadMore() {
  if (hasNextPage.value && !isLoadingMore.value) {
    page.value++
    fetchHistory(false)
  }
}

function setFilterType(val: number) {
  if (filterType.value === val) return
  filterType.value = val
  fetchHistory(true)
}

function setFilterTime(val: number) {
  if (filterTime.value === val) return
  filterTime.value = val
  fetchHistory(true)
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      fetchBalance()
      fetchHistory(true)
    }
  },
  { immediate: true }
)
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
        v-if="modelValue"
        class="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none font-outfit overscroll-contain"
        @click.self="handleClose"
      >
        <div
          class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-border/80 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-border/80 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Wallet class="w-4 h-4" />
              </div>
              <div>
                <h3 class="font-outfit font-bold text-base text-text leading-tight">
                  Saldo & Riwayat Transaksi
                </h3>
                <p class="font-outfit text-xs text-text-muted mt-0.5">
                  Pantau mutasi masuk dan keluar dompet BekasKu
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text-muted hover:text-text transition-colors cursor-pointer"
              @click="handleClose"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body Scrollable Area -->
          <div class="p-5 overflow-y-auto space-y-4 flex-1">
            <!-- Saldo Card -->
            <div
              class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white p-5 shadow-sm"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-outfit text-xs font-medium text-white/80">
                  Total Saldo Saya
                </span>
                <button
                  type="button"
                  class="text-white/80 hover:text-white transition-colors cursor-pointer p-1"
                  @click="showBalance = !showBalance"
                >
                  <Eye v-if="!showBalance" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>

              <div class="font-outfit font-black text-2xl sm:text-3xl tracking-tight mb-2">
                <span v-if="isBalanceLoading">Rp ...</span>
                <span v-else-if="showBalance">{{ formatRupiah(currentBalance) }}</span>
                <span v-else>Rp ••••••••</span>
              </div>

              <p class="font-outfit text-[11px] text-white/70 leading-relaxed">
                Penghasilan transaksi yang selesai otomatis masuk ke saldo Anda dan dapat dicairkan.
              </p>
            </div>

            <!-- Filter Controls -->
            <div class="space-y-2">
              <!-- Filter Tipe -->
              <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  v-for="opt in typeOptions"
                  :key="opt.value"
                  type="button"
                  class="px-3 py-1.5 rounded-full text-xs font-outfit font-semibold whitespace-nowrap transition-colors cursor-pointer"
                  :class="
                    filterType === opt.value
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface-2 text-text-muted hover:text-text hover:bg-surface-3'
                  "
                  @click="setFilterType(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>

              <!-- Filter Waktu -->
              <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  v-for="opt in timeOptions"
                  :key="opt.value"
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-outfit font-medium whitespace-nowrap transition-colors cursor-pointer"
                  :class="
                    filterTime === opt.value
                      ? 'bg-text text-white font-semibold'
                      : 'bg-surface-2 text-text-muted hover:text-text'
                  "
                  @click="setFilterTime(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <!-- History List Section -->
            <div class="space-y-2">
              <h4 class="font-outfit font-bold text-xs uppercase tracking-wider text-text-muted">
                Riwayat Mutasi
              </h4>

              <!-- Loading Skeleton -->
              <div v-if="isLoading" class="space-y-2.5">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="p-3.5 rounded-xl border border-border/60 bg-surface-1 animate-pulse flex items-center justify-between"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-border/80" />
                    <div class="space-y-1.5">
                      <div class="w-28 h-3.5 bg-border/80 rounded" />
                      <div class="w-36 h-2.5 bg-border/60 rounded" />
                    </div>
                  </div>
                  <div class="w-20 h-4 bg-border/80 rounded" />
                </div>
              </div>

              <!-- Empty State -->
              <div
                v-else-if="historyList.length === 0"
                class="py-10 text-center flex flex-col items-center justify-center p-4 border border-dashed border-border/80 rounded-2xl bg-surface-1"
              >
                <div class="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center text-text-muted mb-2.5">
                  <Clock class="w-6 h-6" />
                </div>
                <h5 class="font-outfit font-bold text-sm text-text">
                  Belum Ada Riwayat Mutasi
                </h5>
                <p class="font-outfit text-xs text-text-muted mt-1 max-w-xs">
                  Semua perputaran dana dari penjualan, pembelian, atau pengembalian akan tercatat rapi di sini.
                </p>
                <button
                  type="button"
                  class="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  @click="fetchHistory(true)"
                >
                  <RotateCcw class="w-3.5 h-3.5" />
                  Segarkan
                </button>
              </div>

              <!-- List Mutation Items -->
              <div v-else class="space-y-2">
                <BalanceMutationItem
                  v-for="item in historyList"
                  :key="item.id"
                  :item="item"
                />

                <!-- Load More Button -->
                <div v-if="hasNextPage" class="pt-2 text-center">
                  <button
                    type="button"
                    class="w-full py-2.5 rounded-xl border border-border text-xs font-outfit font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer"
                    :disabled="isLoadingMore"
                    @click="loadMore"
                  >
                    {{ isLoadingMore ? 'Memuat...' : 'Muat Lebih Banyak' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-border/80 bg-surface-1 flex justify-end shrink-0">
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl bg-text text-white font-outfit font-semibold text-xs hover:bg-black transition-colors cursor-pointer"
              @click="handleClose"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
