<template>
  <footer class="w-full bg-white border-t border-gray-200 mt-6 text-xs text-gray-700">
    <!-- 1. Editorial Minimalist Trust Strip (4 Columns with Clean Vertical Dividers) -->
    <div class="border-b border-gray-200 bg-[#FAFAFA]">
      <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          <!-- Col 1: Rekber -->
          <div class="flex items-start gap-3.5 pt-4 sm:pt-0 sm:px-4 first:pl-0">
            <div class="w-9 h-9 rounded-lg bg-blue-100/70 text-[#2563EB] flex items-center justify-center shrink-0">
              <ShieldCheck class="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h4 class="font-outfit font-bold text-gray-900 text-xs sm:text-sm">
                Rekber Resmi BekasKu
              </h4>
              <p class="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Proteksi 100% uang kembali jika pesanan tidak sesuai foto &amp; deskripsi.
              </p>
            </div>
          </div>

          <!-- Col 2: Verifikasi Seller -->
          <div class="flex items-start gap-3.5 pt-4 sm:pt-0 sm:px-4">
            <div class="w-9 h-9 rounded-lg bg-amber-100/70 text-[#EBAD25] flex items-center justify-center shrink-0">
              <CheckCircle class="w-5 h-5 text-[#EBAD25]" />
            </div>
            <div>
              <h4 class="font-outfit font-bold text-gray-900 text-xs sm:text-sm">
                Seller Terverifikasi
              </h4>
              <p class="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Semua penjual melalui verifikasi identitas resmi KTP &amp; reputasi toko.
              </p>
            </div>
          </div>

          <!-- Col 3: Pengiriman Terlacak -->
          <div class="flex items-start gap-3.5 pt-4 sm:pt-0 sm:px-4">
            <div class="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck class="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 class="font-outfit font-bold text-gray-900 text-xs sm:text-sm">
                Logistik Terpadu
              </h4>
              <p class="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Pelacakan otomatis real-time dari penjemputan hingga diantar ke alamat Anda.
              </p>
            </div>
          </div>

          <!-- Col 4: Dukungan Pelanggan -->
          <div class="flex items-start gap-3.5 pt-4 sm:pt-0 sm:px-4 last:pr-0">
            <div class="w-9 h-9 rounded-lg bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0">
              <Headphones class="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h4 class="font-outfit font-bold text-gray-900 text-xs sm:text-sm">
                Resolusi Bantuan 24/7
              </h4>
              <p class="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Customer Support siap menengahi dan menyelesaikan kendala transaksi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Main Navigation Links -->
    <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-6">
        <!-- Col 1 -->
        <div class="col-span-1 lg:col-span-2 space-y-3">
          <h4 class="font-outfit font-bold text-gray-900 text-sm">Layanan Pelanggan</h4>
          <ul class="space-y-2 text-gray-600 text-xs">
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Pusat Bantuan &amp; FAQ</NuxtLink></li>
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Cara Belanja Aman</NuxtLink></li>
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Panduan Berjualan</NuxtLink></li>
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Rekening Bersama (Rekber)</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 2 -->
        <div class="col-span-1 lg:col-span-2 space-y-3">
          <h4 class="font-outfit font-bold text-gray-900 text-sm">Jelajahi BekasKu</h4>
          <ul class="space-y-2 text-gray-600 text-xs">
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Tentang BekasKu</NuxtLink></li>
            <li><NuxtLink to="/peduli" class="hover:text-[#2563EB] text-emerald-700 font-medium">BekasKu Peduli</NuxtLink></li>
            <li><NuxtLink to="/seller" class="hover:text-[#2563EB]">BekasKu+ Influencer</NuxtLink></li>
            <li><NuxtLink to="/privacy" class="hover:text-[#2563EB]">Kebijakan Privasi</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 3: Pembayaran -->
        <div class="col-span-2 sm:col-span-1 lg:col-span-3 space-y-3">
          <h4 class="font-outfit font-bold text-gray-900 text-sm">Pembayaran Resmi</h4>
          <div class="grid grid-cols-4 gap-1.5">
            <div
              v-for="pm in paymentMethods"
              :key="pm.name"
              class="h-8 bg-white border border-gray-200 rounded-lg p-1.5 flex items-center justify-center shadow-2xs"
            >
              <img :src="pm.image" :alt="pm.name" class="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>

        <!-- Col 4: Pengiriman -->
        <div class="col-span-2 sm:col-span-1 lg:col-span-3 space-y-3">
          <h4 class="font-outfit font-bold text-gray-900 text-sm">Jasa Pengiriman</h4>
          <div class="grid grid-cols-4 gap-1.5">
            <div
              v-for="c in couriers"
              :key="c.name"
              class="h-8 bg-white border border-gray-200 rounded-lg p-1.5 flex items-center justify-center shadow-2xs"
            >
              <img :src="c.image" :alt="c.name" class="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>

        <!-- Col 5: App & Social Media -->
        <div class="col-span-2 lg:col-span-2 space-y-4">
          <h4 class="font-outfit font-bold text-gray-900 text-sm">Download App &amp; Kontak</h4>
          <div class="flex flex-col gap-2">
            <a :href="PLAY_STORE_URL" target="_blank" class="flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-lg text-[11px] font-bold max-w-[150px]">
              <span>Google Play</span>
            </a>
            <a :href="APP_STORE_URL" target="_blank" class="flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-lg text-[11px] font-bold max-w-[150px]">
              <span>App Store</span>
            </a>
          </div>
          <div>
            <p class="text-[11px] font-bold text-gray-900 mb-1.5">Ikuti Kami</p>
            <div class="flex items-center gap-1.5 flex-wrap">
              <a
                v-for="s in socmedList"
                :key="s.title"
                :href="s.link"
                target="_blank"
                class="w-7 h-7 rounded-full bg-gray-900 hover:bg-[#2563EB] text-white flex items-center justify-center p-1"
              >
                <img v-if="s.logo" :src="s.logo" :alt="s.title" class="w-full h-full object-contain filter invert" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>&copy; 2026 <strong class="text-gray-700">PT Jantaka Ladang Unggul</strong>. Marketplace Jual Beli Barang Bekas &amp; Preloved Terpercaya.</p>
        <div class="flex items-center gap-3">
          <NuxtLink to="/terms" class="hover:text-[#2563EB]">Ketentuan</NuxtLink>
          <span>•</span>
          <NuxtLink to="/privacy" class="hover:text-[#2563EB]">Privasi</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ShieldCheck, CheckCircle, Truck, Headphones } from 'lucide-vue-next'
import { PLAY_STORE_URL, APP_STORE_URL } from '~/utils/constants'
import { useFooterPartners } from '~/composables/useFooterPartners'

const { paymentMethods, couriers } = useFooterPartners()

const socmedList = ref([
  { title: 'Instagram', link: 'https://www.instagram.com/bekasku.id/', logo: 'https://api.bekasku.id/v1/images/instagram.png' },
  { title: 'Facebook', link: 'https://www.facebook.com/bekasku.id/', logo: 'https://api.bekasku.id/v1/images/facebook.png' },
  { title: 'Twitter', link: 'https://x.com/bekasku.id', logo: 'https://api.bekasku.id/v1/images/twitter.png' },
  { title: 'YouTube', link: 'https://www.youtube.com/@bekasku.id', logo: 'https://api.bekasku.id/v1/images/youtube.png' },
  { title: 'TikTok', link: 'https://www.tiktok.com/@bekasku.id', logo: 'https://api.bekasku.id/v1/images/tiktok.png' },
])
</script>
