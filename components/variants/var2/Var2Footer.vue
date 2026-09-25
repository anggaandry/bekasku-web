<template>
  <footer class="w-full bg-[#F3F4F6] border-t border-gray-200 mt-6 text-xs text-gray-700">
    <!-- 1. Floating Elevated Card Trust Bar with 3-Step Rekber Escrow Process -->
    <div class="max-w-[1400px] mx-auto px-4 md:px-8 -translate-y-5">
      <div class="bg-white rounded-2xl p-5 md:p-6 shadow-md border border-gray-100">
        <!-- Title & Badges -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-5 border-b border-gray-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="bg-[#16A34A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                100% TERVERIFIKASI
              </span>
              <h3 class="text-sm sm:text-base font-black font-outfit text-gray-900 tracking-tight">
                Keamanan Transaksi Rekber BekasKu
              </h3>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">
              Belanja barang bekas tanpa was-was dengan alur rekber otomatis dan perlindungan garansi.
            </p>
          </div>

          <!-- Quick Security Badges -->
          <div class="flex items-center gap-2">
            <span class="flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
              <ShieldCheck class="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Garansi Uang Kembali</span>
            </span>
            <span class="flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
              <Lock class="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Escrow Terproteksi</span>
            </span>
          </div>
        </div>

        <!-- 3-Step Rekber Escrow Process Infographic Diagram -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          <!-- Step 1 -->
          <div class="flex items-center gap-3.5 bg-blue-50/60 border border-blue-100 p-3 rounded-xl">
            <div class="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              1
            </div>
            <div>
              <h4 class="font-bold text-gray-900 text-xs">Pesan &amp; Bayar ke Rekber</h4>
              <p class="text-[11px] text-gray-500 leading-tight">
                Dana ditahan aman di sistem BekasKu, tidak langsung ke penjual.
              </p>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="flex items-center gap-3.5 bg-amber-50/60 border border-amber-100 p-3 rounded-xl">
            <div class="w-8 h-8 rounded-full bg-[#EBAD25] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              2
            </div>
            <div>
              <h4 class="font-bold text-gray-900 text-xs">Penjual Kirim Barang</h4>
              <p class="text-[11px] text-gray-500 leading-tight">
                Pengiriman dengan resi otomatis terintegrasi ekspedisi resmi.
              </p>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="flex items-center gap-3.5 bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl">
            <div class="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              3
            </div>
            <div>
              <h4 class="font-bold text-gray-900 text-xs">Cek &amp; Dana Diteruskan</h4>
              <p class="text-[11px] text-gray-500 leading-tight">
                Setelah barang diterima sesuai, dana otomatis dicairkan ke penjual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Main Navigation Links -->
    <div class="max-w-[1400px] mx-auto px-4 md:px-8 pb-10">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-6">
        <!-- Col 1 -->
        <div class="col-span-1 lg:col-span-2 space-y-3">
          <h4 class="font-outfit font-bold text-gray-900 text-sm">Layanan Pelanggan</h4>
          <ul class="space-y-2 text-gray-600 text-xs">
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Pusat Bantuan &amp; FAQ</NuxtLink></li>
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Cara Belanja Aman</NuxtLink></li>
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Rekening Bersama (Rekber)</NuxtLink></li>
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Garansi &amp; Pengembalian</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 2 -->
        <div class="col-span-1 lg:col-span-2 space-y-3">
          <h4 class="font-outfit font-bold text-gray-900 text-sm">Jelajahi BekasKu</h4>
          <ul class="space-y-2 text-gray-600 text-xs">
            <li><NuxtLink to="/terms" class="hover:text-[#2563EB]">Tentang Kami</NuxtLink></li>
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
          <h4 class="font-outfit font-bold text-gray-900 text-sm">Download App</h4>
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
import { ShieldCheck, Lock } from 'lucide-vue-next'
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
