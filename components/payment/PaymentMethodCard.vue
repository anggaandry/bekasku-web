<script setup lang="ts">
import { ref } from 'vue'
import {
  Download,
  RotateCw,
  Copy,
  Check,
  Info,
  ExternalLink,
  Smartphone,
  Send,
  CheckCircle2,
  Loader2,
} from 'lucide-vue-next'
import type { PaymentDashboardData } from '~/types/payment'
import { useFormat } from '~/composables/useFormat'
import PaymentLogo from '~/components/payment/PaymentLogo.vue'

const props = defineProps<{
  data: PaymentDashboardData
  checkingStatus?: boolean
  sendingMakePayment?: boolean
  downloadingQr?: boolean
}>()

const emit = defineEmits<{
  (e: 'check-status'): void
  (e: 'download-qr'): void
  (e: 'make-payment'): void
}>()

const { formatPrice } = useFormat()

const copied = ref(false)

function copyPaymentNumber() {
  if (!props.data.payment_number) return
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(props.data.payment_number)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

const isRetail = computed(() => {
  const cat = (props.data.payment_category || '').toLowerCase()
  const name = (props.data.payment_name || '').toLowerCase()
  return (
    cat.includes('gerai') ||
    cat.includes('retail') ||
    name.includes('indomaret') ||
    name.includes('alfamart')
  )
})
</script>

<template>
  <div
    class="w-full bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-2xs font-outfit"
  >
    <!-- Card Header: Logo, Name & Total Tagihan -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <PaymentLogo
          :payment-name="data.payment_name"
          :logo-url="data.payment_logo"
          :width="48"
          :height="32"
        />
        <div class="min-w-0">
          <h2 class="text-sm sm:text-base font-bold text-text truncate">
            {{ data.payment_name || 'Pembayaran' }}
          </h2>
          <p class="text-xs text-text-muted truncate">
            {{ data.payment_category || 'Metode Pembayaran' }}
          </p>
        </div>
      </div>

      <div class="text-right shrink-0">
        <p class="text-[11px] font-medium text-text-muted">Total Tagihan</p>
        <p class="text-sm sm:text-base font-extrabold text-primary tabular-nums">
          {{ formatPrice(data.total_payment) }}
        </p>
      </div>
    </div>

    <div class="h-px bg-border/70 my-4" />

    <!-- ── 1. QRIS Display Section ──────────────────────────────────────── -->
    <template v-if="data.qr_url">
      <div class="flex flex-col items-center">
        <div
          class="w-[220px] h-[220px] p-3 rounded-2xl bg-surface-2 border border-border-light flex items-center justify-center overflow-hidden"
        >
          <img
            :src="data.qr_url"
            alt="Kode QRIS"
            width="220"
            height="220"
            class="w-full h-full object-contain"
            loading="eager"
          />
        </div>

        <div class="w-full mt-4 space-y-2.5">
          <button
            type="button"
            :disabled="downloadingQr"
            class="w-full py-3 px-4 rounded-xl border border-primary/40 bg-white hover:bg-primary/5 text-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-98 disabled:opacity-60"
            @click="emit('download-qr')"
          >
            <Loader2 v-if="downloadingQr" class="w-4 h-4 animate-spin" />
            <Download v-else class="w-4 h-4 stroke-[2.2]" />
            <span>Unduh Kode QR</span>
          </button>

          <button
            type="button"
            :disabled="checkingStatus"
            class="w-full py-3 px-4 rounded-xl border border-border hover:border-primary/40 bg-white hover:bg-surface-2 text-primary text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-98 disabled:opacity-60"
            @click="emit('check-status')"
          >
            <Loader2 v-if="checkingStatus" class="w-4 h-4 animate-spin" />
            <RotateCw v-else class="w-4 h-4 stroke-[2]" />
            <span>Cek Status Pembayaran</span>
          </button>
        </div>
      </div>
    </template>

    <!-- ── 2. OVO Direct Push Section ────────────────────────────────────── -->
    <template v-else-if="data.payment_direct && data.with_input">
      <div class="space-y-3.5">
        <div
          class="p-3.5 rounded-xl bg-surface-2 border border-border-light flex items-center gap-3"
        >
          <Smartphone class="w-5 h-5 text-primary shrink-0 stroke-[2]" />
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-medium text-text-muted">
              Nomor HP Terdaftar
            </p>
            <p class="text-sm sm:text-base font-bold text-text truncate tracking-wide mt-0.5">
              {{ data.input || '-' }}
            </p>
          </div>
        </div>

        <div
          v-if="data.has_sent_payment"
          class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-text flex items-start gap-2.5 leading-relaxed"
        >
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            Permintaan pembayaran telah dikirim ke aplikasi
            <strong>{{ data.payment_name }}</strong>. Silakan buka aplikasi
            {{ data.payment_name }} Anda dan setujui pembayaran.
          </p>
        </div>
        <div
          v-else
          class="p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-text flex items-start gap-2.5 leading-relaxed"
        >
          <Info class="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            Klik tombol di bawah untuk mengirim notifikasi tagihan ke aplikasi
            <strong>{{ data.payment_name }}</strong> pada nomor HP Anda.
          </p>
        </div>

        <div class="pt-1 space-y-2.5">
          <button
            type="button"
            :disabled="sendingMakePayment"
            class="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-98 disabled:opacity-60"
            @click="emit('make-payment')"
          >
            <Loader2 v-if="sendingMakePayment" class="w-4 h-4 animate-spin" />
            <RotateCw
              v-else-if="data.has_sent_payment"
              class="w-4 h-4 stroke-[2]"
            />
            <Send v-else class="w-4 h-4 stroke-[2]" />
            <span>
              {{
                sendingMakePayment
                  ? 'Mengirim Permintaan...'
                  : data.has_sent_payment
                    ? `Kirim Ulang ke ${data.payment_name}`
                    : `Kirim Permintaan ke ${data.payment_name}`
              }}
            </span>
          </button>

          <button
            type="button"
            :disabled="checkingStatus"
            class="w-full py-3 px-4 rounded-xl border border-border hover:border-primary/40 bg-white hover:bg-surface-2 text-primary text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-98 disabled:opacity-60"
            @click="emit('check-status')"
          >
            <Loader2 v-if="checkingStatus" class="w-4 h-4 animate-spin" />
            <RotateCw v-else class="w-4 h-4 stroke-[2]" />
            <span>Cek Status Pembayaran</span>
          </button>
        </div>
      </div>
    </template>

    <!-- ── 3. Direct Redirect / Cashless Link ────────────────────────────── -->
    <template v-else-if="data.payment_direct && (data.payment_link || !data.payment_number)">
      <div class="space-y-3.5">
        <div
          class="p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-text flex items-start gap-2.5 leading-relaxed"
        >
          <Info class="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            Anda akan diarahkan ke halaman pembayaran
            <strong>{{ data.payment_name }}</strong> untuk menyelesaikan
            transaksi. Setelah bayar, status transaksi akan diperbarui otomatis.
          </p>
        </div>

        <div class="pt-1 space-y-2.5">
          <button
            type="button"
            class="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-98"
            @click="emit('make-payment')"
          >
            <ExternalLink class="w-4 h-4 stroke-[2]" />
            <span>Bayar Sekarang</span>
          </button>

          <button
            type="button"
            :disabled="checkingStatus"
            class="w-full py-3 px-4 rounded-xl border border-border hover:border-primary/40 bg-white hover:bg-surface-2 text-primary text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-98 disabled:opacity-60"
            @click="emit('check-status')"
          >
            <Loader2 v-if="checkingStatus" class="w-4 h-4 animate-spin" />
            <RotateCw v-else class="w-4 h-4 stroke-[2]" />
            <span>Cek Status Pembayaran</span>
          </button>
        </div>
      </div>
    </template>

    <!-- ── 4. Virtual Account Bank & Retail / Gerai ──────────────────────── -->
    <template v-else-if="data.payment_number">
      <div class="space-y-3.5">
        <div>
          <label class="block text-xs font-semibold text-text-muted mb-1.5">
            {{ isRetail ? 'Kode Pembayaran' : 'Nomor Virtual Account' }}
          </label>
          <div
            class="p-3 sm:p-3.5 rounded-xl bg-surface-2 border border-border-light flex items-center justify-between gap-3"
          >
            <span
              class="text-base sm:text-lg font-extrabold text-primary tracking-wider font-mono select-all truncate"
            >
              {{ data.payment_number }}
            </span>

            <button
              type="button"
              class="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              @click="copyPaymentNumber"
            >
              <Check v-if="copied" class="w-3.5 h-3.5 stroke-[2.5]" />
              <Copy v-else class="w-3.5 h-3.5 stroke-[2]" />
              <span>{{ copied ? 'Tersalin' : 'Salin' }}</span>
            </button>
          </div>
        </div>

        <div
          class="p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-text flex items-start gap-2.5 leading-relaxed"
        >
          <Info class="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            Gunakan nomor di atas saat melakukan transfer. Pembayaran akan
            terverifikasi secara otomatis.
          </p>
        </div>

        <div class="pt-1">
          <button
            type="button"
            :disabled="checkingStatus"
            class="w-full py-3 px-4 rounded-xl border border-border hover:border-primary/40 bg-white hover:bg-surface-2 text-primary text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-98 disabled:opacity-60"
            @click="emit('check-status')"
          >
            <Loader2 v-if="checkingStatus" class="w-4 h-4 animate-spin" />
            <RotateCw v-else class="w-4 h-4 stroke-[2]" />
            <span>Cek Status Pembayaran</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

