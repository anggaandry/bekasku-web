<script setup lang="ts">
defineProps<{
  notifOrder: boolean
  notifPromo: boolean
  notifFeed: boolean
  notifChat: boolean
}>()

const emit = defineEmits<{
  toggle: [type: 'order' | 'promo' | 'feed' | 'chat']
}>()
</script>

<template>
  <div class="bg-surface rounded-2xl border border-border/60 shadow-xs p-5 sm:p-6 space-y-5">
    <div>
      <h2 class="text-lg font-extrabold text-text">Pengaturan Notifikasi</h2>
      <p class="text-xs text-text-muted mt-0.5">Atur jenis pemberitahuan yang ingin Anda terima di BekasKu.</p>
    </div>

    <div class="divide-y divide-border/60">
      <div class="py-4 flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-bold text-text">Status Pesanan & Transaksi</p>
          <p class="text-xs text-text-muted mt-0.5">Notifikasi pembayaran, pengiriman, dan pembaruan status komplain.</p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="notifOrder"
          aria-label="Toggle notifikasi status pesanan dan transaksi"
          class="w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer"
          :class="notifOrder ? 'bg-primary' : 'bg-border'"
          @click="emit('toggle', 'order')"
        >
          <span
            class="w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-all"
            :class="notifOrder ? 'left-6' : 'left-1'"
          />
        </button>
      </div>

      <div class="py-4 flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-bold text-text">Pesan & Chat Penjual/Pembeli</p>
          <p class="text-xs text-text-muted mt-0.5">Pemberitahuan pesan masuk dan penawaran harga di ruang obrolan.</p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="notifChat"
          aria-label="Toggle notifikasi pesan dan chat"
          class="w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer"
          :class="notifChat ? 'bg-primary' : 'bg-border'"
          @click="emit('toggle', 'chat')"
        >
          <span
            class="w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-all"
            :class="notifChat ? 'left-6' : 'left-1'"
          />
        </button>
      </div>

      <div class="py-4 flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-bold text-text">Aktivitas Feed & Komunitas</p>
          <p class="text-xs text-text-muted mt-0.5">Notifikasi komentar, suka, dan pengikut baru di profil Anda.</p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="notifFeed"
          aria-label="Toggle notifikasi aktivitas feed dan komunitas"
          class="w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer"
          :class="notifFeed ? 'bg-primary' : 'bg-border'"
          @click="emit('toggle', 'feed')"
        >
          <span
            class="w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-all"
            :class="notifFeed ? 'left-6' : 'left-1'"
          />
        </button>
      </div>

      <div class="py-4 flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-bold text-text">Promo, Lelang & Rekomendasi</p>
          <p class="text-xs text-text-muted mt-0.5">Info diskon spesial, jadwal lelang baru, dan penawaran eksklusif BekasKu.</p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="notifPromo"
          aria-label="Toggle notifikasi promo dan lelang"
          class="w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer"
          :class="notifPromo ? 'bg-primary' : 'bg-border'"
          @click="emit('toggle', 'promo')"
        >
          <span
            class="w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-all"
            :class="notifPromo ? 'left-6' : 'left-1'"
          />
        </button>
      </div>
    </div>
  </div>
</template>

