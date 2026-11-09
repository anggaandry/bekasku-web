<script setup lang="ts">
import {
  Wallet,
  Eye,
  EyeOff,
  Landmark,
  CreditCard,
  Lock,
} from 'lucide-vue-next'
import { formatRupiah } from '~/utils/format'

const props = withDefaults(
  defineProps<{
    balance: number
    isLoading?: boolean
    isVerified?: boolean
  }>(),
  {
    isLoading: false,
    isVerified: true,
  }
)

const emit = defineEmits<{
  'open-withdraw': []
  'open-bank': []
  'require-verification': []
}>()

const { showNotification } = useNotification()

const isBalanceVisible = ref(true)

function handleTarikSaldoClick() {
  if (!props.isVerified) {
    showNotification({
      type: 'warning',
      message: 'Silakan verifikasi kartu identitas (KTP) terlebih dahulu untuk melakukan penarikan saldo.',
    })
    emit('require-verification')
    return
  }
  emit('open-withdraw')
}

function handleRekeningClick() {
  if (!props.isVerified) {
    showNotification({
      type: 'warning',
      message: 'Silakan verifikasi kartu identitas (KTP) terlebih dahulu sebelum mendaftarkan rekening bank.',
    })
    emit('require-verification')
    return
  }
  emit('open-bank')
}
</script>

<template>
  <div class="font-outfit select-none">
    <!-- Red Balance Card (Mobile & Desktop) -->
    <div
      class="bg-gradient-to-br from-primary to-primary-dark text-white p-5 sm:p-6 rounded-b-3xl md:rounded-3xl shadow-lg relative overflow-hidden"
    >
      <!-- Background subtle decor circles -->
      <div
        class="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none"
      />
      <div
        class="absolute -right-4 -bottom-10 w-24 h-24 rounded-full bg-white/5 pointer-events-none"
      />

      <div class="relative z-1">
        <!-- Label & Eye Toggle -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
            >
              <Wallet class="w-4 h-4" />
            </div>
            <span class="text-sm font-medium text-white/90">
              Total Saldo
            </span>
          </div>

          <button
            type="button"
            class="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
            :title="isBalanceVisible ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'"
            @click="isBalanceVisible = !isBalanceVisible"
          >
            <EyeOff v-if="isBalanceVisible" class="w-4 h-4" />
            <Eye v-else class="w-4 h-4" />
          </button>
        </div>

        <!-- Balance Amount -->
        <div class="mt-3">
          <div v-if="isLoading" class="h-9 w-40 bg-white/20 rounded-lg animate-pulse" />
          <h2
            v-else
            class="text-2xl sm:text-3xl font-bold tracking-tight text-white"
          >
            {{ isBalanceVisible ? formatRupiah(balance) : 'Rp ••••••••' }}
          </h2>
        </div>
      </div>
    </div>

    <!-- Action Cards: Tarik Saldo & Rekening -->
    <div class="grid grid-cols-2 gap-3 sm:gap-4 mt-4 px-4 sm:px-0">
      <!-- Tarik Saldo Card -->
      <button
        type="button"
        class="rounded-2xl p-4 border transition-all flex flex-col items-center justify-center gap-2 text-center relative group"
        :class="[
          !isVerified
            ? 'bg-surface-1 border-dashed border-border opacity-75 cursor-not-allowed'
            : 'bg-white border-border/80 shadow-2xs hover:border-primary/60 hover:shadow-xs cursor-pointer',
        ]"
        @click="handleTarikSaldoClick"
      >
        <!-- Lock indicator if not verified -->
        <div
          v-if="!isVerified"
          class="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-surface-3 flex items-center justify-center text-text-muted"
          title="Butuh verifikasi KTP"
        >
          <Lock class="w-3 h-3" />
        </div>

        <div
          class="w-10 h-10 rounded-full flex items-center justify-center transition-transform"
          :class="
            !isVerified
              ? 'bg-surface-2 text-text-muted'
              : 'bg-primary/10 text-primary group-hover:scale-105'
          "
        >
          <Landmark class="w-5 h-5" />
        </div>
        <div>
          <span
            class="font-bold text-xs sm:text-sm block"
            :class="!isVerified ? 'text-text-muted' : 'text-text'"
          >
            Tarik Saldo
          </span>
          <span
            v-if="!isVerified"
            class="text-[10px] text-danger font-medium block mt-0.5"
          >
            Butuh KTP
          </span>
        </div>
      </button>

      <!-- Rekening Card -->
      <button
        type="button"
        class="rounded-2xl p-4 border transition-all flex flex-col items-center justify-center gap-2 text-center relative group"
        :class="[
          !isVerified
            ? 'bg-surface-1 border-dashed border-border opacity-75 cursor-not-allowed'
            : 'bg-white border-border/80 shadow-2xs hover:border-sky-500/60 hover:shadow-xs cursor-pointer',
        ]"
        @click="handleRekeningClick"
      >
        <!-- Lock indicator if not verified -->
        <div
          v-if="!isVerified"
          class="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-surface-3 flex items-center justify-center text-text-muted"
          title="Butuh verifikasi KTP"
        >
          <Lock class="w-3 h-3" />
        </div>

        <div
          class="w-10 h-10 rounded-full flex items-center justify-center transition-transform"
          :class="
            !isVerified
              ? 'bg-surface-2 text-text-muted'
              : 'bg-sky-50 text-sky-600 group-hover:scale-105'
          "
        >
          <CreditCard class="w-5 h-5" />
        </div>
        <div>
          <span
            class="font-bold text-xs sm:text-sm block"
            :class="!isVerified ? 'text-text-muted' : 'text-text'"
          >
            Rekening
          </span>
          <span
            v-if="!isVerified"
            class="text-[10px] text-danger font-medium block mt-0.5"
          >
            Butuh KTP
          </span>
        </div>
      </button>
    </div>
  </div>
</template>
