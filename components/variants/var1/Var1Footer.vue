<template>
  <footer class="w-full bg-[#FAFAFA] border-t border-gray-200 mt-6 text-xs text-gray-700">
    <!-- 1. Variant 1 Feature: Dark Surface (#16191E) High-Impact Trust & Rekber Bar -->
    <div class="bg-[#16191E] text-white py-6 border-b border-neutral-800">
      <div class="max-w-[1400px] mx-auto px-4 md:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div class="flex items-center gap-3 text-center md:text-left">
            <div class="w-10 h-10 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[#2563EB]">
              <ShieldCheck class="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <h3 class="text-sm font-black font-outfit text-white tracking-wide uppercase">
                Sistem Rekening Bersama (Rekber) BekasKu
              </h3>
              <p class="text-xs text-gray-400">
                100% Proteksi Dana Pembeli &amp; Garansi Pencairan Aman Penjual
              </p>
            </div>
          </div>

          <NuxtLink
            to="/terms"
            class="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Pelajari Cara Kerja Rekber</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>

        <!-- 4 Guarantee Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div class="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-xl flex items-start gap-3">
            <Lock class="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
            <div>
              <h4 class="font-bold text-white text-xs">Uang Ditahan Aman</h4>
              <p class="text-[11px] text-gray-400 mt-0.5 leading-tight">
                Dana ditampung di escrow hingga barang sampai &amp; sesuai deskripsi.
              </p>
            </div>
          </div>

          <div class="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-xl flex items-start gap-3">
            <RotateCcw class="w-5 h-5 text-[#EBAD25] shrink-0 mt-0.5" />
            <div>
              <h4 class="font-bold text-white text-xs">Garansi Retur 2 Hari</h4>
              <p class="text-[11px] text-gray-400 mt-0.5 leading-tight">
                Klaim pengembalian dana 100% jika barang rusak atau palsu.
              </p>
            </div>
          </div>

          <div class="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-xl flex items-start gap-3">
            <Truck class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 class="font-bold text-white text-xs">Ekspedisi Terintegrasi</h4>
              <p class="text-[11px] text-gray-400 mt-0.5 leading-tight">
                Resi otomatis real-time dari J&amp;T, SiCepat, JNE, Instant &amp; Kargo.
              </p>
            </div>
          </div>

          <div class="bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-xl flex items-start gap-3">
            <Headphones class="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 class="font-bold text-white text-xs">CS Resolusi Konflik</h4>
              <p class="text-[11px] text-gray-400 mt-0.5 leading-tight">
                Tim penengah profesional siap membantu mediasi transaksi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Main Navigation Links -->
    <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-6">
        <!-- Col 1: Layanan Pelanggan -->
        <div class="col-span-1 lg:col-span-2 space-y-3">
          <h4 class="font-outfit font-bold text-gray-900 text-sm">Layanan Pelanggan</h4>
          <ul class="space-y-2 text-gray-600 text-xs">
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Pusat Bantuan &amp; FAQ</NuxtLink></li>
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Cara Belanja Aman</NuxtLink></li>
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Cara Berjualan Cepat</NuxtLink></li>
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Rekening Bersama (Rekber)</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 2: Jelajahi BekasKu -->
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
          <h4 class="font-outfit font-bold text-gray-900 text-sm">Metode Pembayaran</h4>
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

        <!-- Col 5: Download App & Kontak -->
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
          <!-- Socmed Icons -->
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
import {
  ShieldCheck,
  ChevronRight,
  Lock,
  RotateCcw,
  Truck,
  Headphones,
} from 'lucide-vue-next'
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
