<script setup lang="ts">
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-vue-next'

const route = useRoute()

useHead({
  title: 'Transaksi Berhasil - BekasKu',
  meta: [
    { name: 'description', content: 'Pesanan Anda berhasil dibuat di BekasKu.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const paymentId = computed(() => (route.query.payment_id as string) || '')
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg">
    <main class="flex-1 flex items-center justify-center p-4 py-16">
      <div class="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs text-center flex flex-col items-center">
        <!-- Success Icon -->
        <div class="w-16 h-16 rounded-full bg-success/10 border border-success/20 text-success flex items-center justify-center mb-5">
          <CheckCircle2 class="w-8 h-8 stroke-[2.5]" />
        </div>

        <h2 class="text-lg sm:text-xl font-bold text-text font-outfit">
          Pesanan Berhasil Dibuat!
        </h2>

        <p class="text-xs sm:text-sm text-text-muted mt-2 max-w-sm leading-relaxed">
          Terima kasih! Pesanan belanjaan Anda telah berhasil diproses oleh sistem BekasKu.
        </p>

        <div v-if="paymentId" class="mt-4 p-3 bg-surface-2 rounded-xl border border-border w-full text-xs text-text-muted">
          ID Pembayaran: <strong class="text-text font-mono">{{ paymentId }}</strong>
        </div>

        <!-- Action Buttons -->
        <div class="w-full mt-6 space-y-3">
          <NuxtLink
            to="/cart"
            class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold font-outfit flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <ShoppingBag class="w-4 h-4" />
            <span>Kembali ke Keranjang</span>
          </NuxtLink>

          <NuxtLink
            to="/"
            class="w-full h-12 rounded-xl border border-border-light bg-white hover:bg-surface-2 text-xs sm:text-sm font-semibold font-outfit text-text flex items-center justify-center gap-2 transition-colors"
          >
            <span>Lanjut Belanja</span>
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

