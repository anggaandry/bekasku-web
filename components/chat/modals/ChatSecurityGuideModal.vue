<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { X, ShieldAlert } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const securityGuides = [
  {
    title: 'Jangan Transaksi di Luar BekasKu',
    description:
      'Selalu gunakan sistem pembayaran resmi BekasKu. Hindari transfer langsung ke rekening pribadi penjual atau pembeli karena berisiko penipuan dan tidak dilindungi oleh sistem.',
  },
  {
    title: 'Jangan Klik Tautan Mencurigakan',
    description:
      'Abaikan link yang dikirim lewat chat atau pesan di luar aplikasi, terutama yang meminta login, verifikasi akun, atau pembayaran.',
  },
  {
    title: 'Jaga Kerahasiaan Data Pribadi',
    description:
      'Jangan pernah membagikan kode OTP, password, PIN, atau data sensitif lainnya kepada siapa pun, termasuk pihak yang mengaku dari BekasKu.',
  },
  {
    title: 'Pastikan Status Pembayaran di Aplikasi',
    description:
      'Penjual hanya boleh mengirim barang setelah status pembayaran tercatat resmi di aplikasi BekasKu, bukan dari bukti transfer atau screenshot.',
  },
  {
    title: 'Waspada Tawaran Tidak Masuk Akal',
    description:
      'Harga terlalu murah, permintaan transaksi cepat di luar aplikasi, atau tekanan untuk segera bayar adalah tanda umum penipuan.',
  },
]

function handleWindowKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape' && props.modelValue) {
    close()
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!import.meta.client) return
    if (isOpen) {
      window.addEventListener('keydown', handleWindowKeydown)
    } else {
      window.removeEventListener('keydown', handleWindowKeydown)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleWindowKeydown)
  }
})

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-guide-modal-title"
      @click="close"
    >
      <div
        class="bg-white w-full sm:max-w-lg max-h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-xl"
        @click.stop
      >
        <!-- Header -->
        <div class="px-5 py-4 border-b border-border-light flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShieldAlert class="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 id="security-guide-modal-title" class="font-outfit font-bold text-base sm:text-lg text-text">
              Panduan Keamanan
            </h3>
          </div>
          <button
            type="button"
            @click="close"
            class="min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] -mr-2 rounded-full hover:bg-surface-2 text-text flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Tutup"
          >
            <X class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <!-- Body (matches security_guide_view.dart) -->
        <div class="p-5 sm:p-6 overflow-y-auto space-y-5">
          <p class="font-outfit text-sm text-text leading-relaxed">
            Demi kenyamanan dan keamanan bersama, pastikan kamu selalu mengikuti panduan berikut saat bertransaksi di BekasKu:
          </p>

          <ol class="space-y-4">
            <li
              v-for="(item, idx) in securityGuides"
              :key="item.title"
              class="flex items-start gap-2.5"
            >
              <span class="font-outfit font-semibold text-sm text-text shrink-0">
                {{ idx + 1 }}.
              </span>
              <div class="space-y-1">
                <h4 class="font-outfit font-semibold text-sm text-text">
                  {{ item.title }}
                </h4>
                <p class="font-outfit text-sm text-text-muted leading-relaxed">
                  {{ item.description }}
                </p>
              </div>
            </li>
          </ol>

          <p class="font-outfit text-sm text-text leading-relaxed pt-1">
            Jika menemukan aktivitas mencurigakan, segera laporkan melalui fitur bantuan di aplikasi BekasKu. Keamanan transaksi kamu adalah prioritas kami.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

