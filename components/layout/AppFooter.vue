<template>
  <footer class="w-full bg-[#FAFAFA] border-t border-gray-200 mt-4 sm:mt-6 text-xs text-gray-700">
    <!-- 1. Top E-Commerce Trust & Guarantee Bar -->
    <div class="border-b border-gray-200 bg-white">
      <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-5">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Item 1: Rekber Aman -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
              <ShieldCheck class="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h4 class="font-outfit font-bold text-gray-900 text-xs sm:text-sm">
                100% Rekber Aman
              </h4>
              <p class="text-[11px] text-gray-500 leading-tight">
                Dana aman, diteruskan setelah barang diterima
              </p>
            </div>
          </div>

          <!-- Item 2: Pengiriman Terpercaya -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-[#EBAD25] flex items-center justify-center shrink-0 border border-amber-100">
              <Truck class="w-5 h-5 text-[#EBAD25]" />
            </div>
            <div>
              <h4 class="font-outfit font-bold text-gray-900 text-xs sm:text-sm">
                Ekspedisi Lengkap
              </h4>
              <p class="text-[11px] text-gray-500 leading-tight">
                Reguler, Instant, Same Day &amp; Kargo
              </p>
            </div>
          </div>

          <!-- Item 3: Transaksi Praktis -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0 border border-emerald-100">
              <CreditCard class="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <h4 class="font-outfit font-bold text-gray-900 text-xs sm:text-sm">
                Pembayaran Fleksibel
              </h4>
              <p class="text-[11px] text-gray-500 leading-tight">
                Transfer VA, QRIS, E-Wallet, &amp; Gerai Retail
              </p>
            </div>
          </div>

          <!-- Item 4: Dukungan 24/7 -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-50 text-[#E31B23] flex items-center justify-center shrink-0 border border-rose-100">
              <Headphones class="w-5 h-5 text-[#E31B23]" />
            </div>
            <div>
              <h4 class="font-outfit font-bold text-gray-900 text-xs sm:text-sm">
                Bantuan Siaga
              </h4>
              <p class="text-[11px] text-gray-500 leading-tight">
                Customer Care &amp; panduan transaksi mudah
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Main E-Commerce Footer Navigation (5 Columns) -->
    <div class="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-6">
        <!-- Col 1: Layanan Pelanggan (2 cols) -->
        <div class="col-span-1 sm:col-span-1 lg:col-span-2 space-y-3">
          <h4 class="font-outfit font-bold text-gray-900 text-sm tracking-tight">
            Layanan Pelanggan
          </h4>
          <ul class="space-y-2 text-gray-600 text-xs">
            <li>
              <NuxtLink to="/terms" class="hover:text-[#2563EB] transition-colors">
                Pusat Bantuan &amp; FAQ
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/terms" class="hover:text-[#2563EB] transition-colors">
                Cara Belanja Aman
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/terms" class="hover:text-[#2563EB] transition-colors">
                Cara Berjualan Cepat
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/terms" class="hover:text-[#2563EB] transition-colors">
                Rekening Bersama (Rekber)
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/terms" class="hover:text-[#2563EB] transition-colors">
                Panduan Pengembalian
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/terms" class="hover:text-[#2563EB] transition-colors">
                Hubungi Dukungan CS
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 2: Jelajahi BekasKu (2 cols) -->
        <div class="col-span-1 sm:col-span-1 lg:col-span-2 space-y-3">
          <h4 class="font-outfit font-bold text-gray-900 text-sm tracking-tight">
            Jelajahi BekasKu
          </h4>
          <ul class="space-y-2 text-gray-600 text-xs">
            <li>
              <NuxtLink to="/terms" class="hover:text-[#2563EB] transition-colors">
                Tentang BekasKu
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/peduli" class="hover:text-[#2563EB] transition-colors flex items-center gap-1.5 font-medium text-emerald-700">
                <span>BekasKu Peduli</span>
                <span class="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded-sm font-bold">Baru</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/#jasa" class="hover:text-[#2563EB] transition-colors">
                Servis Gadget &amp; iPhone
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/seller" class="hover:text-[#2563EB] transition-colors">
                BekasKu+ Influencer
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/privacy" class="hover:text-[#2563EB] transition-colors">
                Kebijakan Privasi
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/terms" class="hover:text-[#2563EB] transition-colors">
                Syarat &amp; Ketentuan
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 3: Pembayaran Resmi dari Database (3 cols) -->
        <div class="col-span-2 sm:col-span-1 lg:col-span-3 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-outfit font-bold text-gray-900 text-sm tracking-tight">
              Metode Pembayaran
            </h4>
          </div>

          <!-- Payment Logos Grid from MongoDB bkk_payment_methods -->
          <div class="grid grid-cols-4 gap-1.5 sm:gap-2">
            <div
              v-for="pm in paymentMethods"
              :key="pm.code || pm.name"
              class="h-8 sm:h-9 bg-white border border-gray-200 rounded-lg p-1.5 flex items-center justify-center shadow-2xs hover:border-[#2563EB] hover:shadow-xs transition-all group cursor-default"
              :title="pm.name"
            >
              <img
                :src="pm.image"
                :alt="pm.name"
                class="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform"
                loading="lazy"
                @error="onImgError($event, pm.name)"
              />
            </div>
          </div>
          <p class="text-[10px] text-gray-500 pt-1">
            Mendukung Virtual Account, E-Wallet, QRIS, &amp; Gerai Retail di seluruh Indonesia.
          </p>
        </div>

        <!-- Col 4: Jasa Pengiriman Resmi dari Database (3 cols) -->
        <div class="col-span-2 sm:col-span-1 lg:col-span-3 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-outfit font-bold text-gray-900 text-sm tracking-tight">
              Jasa Pengiriman
            </h4>
          </div>

          <!-- Courier Logos Grid from MongoDB bkk_courriers -->
          <div class="grid grid-cols-4 gap-1.5 sm:gap-2">
            <div
              v-for="courier in couriers"
              :key="courier.code || courier.name"
              class="h-8 sm:h-9 bg-white border border-gray-200 rounded-lg p-1.5 flex items-center justify-center shadow-2xs hover:border-[#2563EB] hover:shadow-xs transition-all group cursor-default"
              :title="courier.name"
            >
              <img
                :src="courier.image"
                :alt="courier.name"
                class="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform"
                loading="lazy"
                @error="onImgError($event, courier.name)"
              />
            </div>
          </div>
          <p class="text-[10px] text-gray-500 pt-1">
            Integrasi pelacakan otomatis dari pick up hingga paket diterima di tangan Anda.
          </p>
        </div>

        <!-- Col 5: Download App, Ikuti Kami & Kontak (2 cols) -->
        <div class="col-span-2 sm:col-span-2 lg:col-span-2 space-y-4">
          <div>
            <h4 class="font-outfit font-bold text-gray-900 text-sm tracking-tight mb-2.5">
              Download BekasKu App
            </h4>

            <!-- Official Standard Store Download Buttons -->
            <div class="flex flex-col gap-2">
              <!-- Google Play -->
              <a
                :href="PLAY_STORE_URL"
                target="_blank"
                rel="noopener"
                class="group flex items-center gap-2.5 bg-black hover:bg-neutral-900 text-white px-3 py-1.5 rounded-lg border border-neutral-800 transition-all shadow-2xs hover:shadow-xs w-full max-w-[155px]"
              >
                <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186a2.04 2.04 0 01-.61-1.464V3.278c0-.57.228-1.097.61-1.464z" fill="#00C1A6"/>
                  <path d="M17.186 8.607L13.793 12l3.393 3.393 3.844-2.187c.725-.413.725-1.085 0-1.498l-3.844-2.101z" fill="#FFBA00"/>
                  <path d="M13.793 12L3.61 1.814c.348-.348.87-.456 1.348-.184l12.228 6.977-3.393 3.393z" fill="#00A2FF"/>
                  <path d="M13.793 12l3.393 3.393L4.958 22.37c-.478.272-1 .164-1.348-.184L13.793 12z" fill="#FA2C56"/>
                </svg>
                <div class="flex flex-col text-left leading-none">
                  <span class="text-[7.5px] uppercase text-gray-300 font-medium tracking-wider">GET IT ON</span>
                  <span class="text-[11.5px] font-bold text-white tracking-tight mt-0.5">Google Play</span>
                </div>
              </a>

              <!-- App Store -->
              <a
                :href="APP_STORE_URL"
                target="_blank"
                rel="noopener"
                class="group flex items-center gap-2.5 bg-black hover:bg-neutral-900 text-white px-3 py-1.5 rounded-lg border border-neutral-800 transition-all shadow-2xs hover:shadow-xs w-full max-w-[155px]"
              >
                <Apple class="w-5 h-5 fill-white text-white shrink-0 -mt-0.5" />
                <div class="flex flex-col text-left leading-none">
                  <span class="text-[7.5px] text-gray-300 font-medium tracking-wider">Download on the</span>
                  <span class="text-[11.5px] font-bold text-white tracking-tight mt-0.5">App Store</span>
                </div>
              </a>
            </div>
          </div>

          <!-- Social Media Follow (Dynamically fetched from /socmed API matching about_view.dart) -->
          <div>
            <p class="text-[11px] font-bold text-gray-900 mb-2">Ikuti Kami</p>
            <div class="flex items-center gap-1.5 flex-wrap">
              <a
                v-for="social in socmedList"
                :key="social._id || social.title"
                :href="social.link"
                target="_blank"
                rel="noopener"
                class="w-7 h-7 rounded-full bg-gray-900 hover:bg-[#2563EB] text-white flex items-center justify-center transition-colors shadow-2xs overflow-hidden group/soc p-1"
                :title="`${social.title}: ${social.description}`"
              >
                <!-- Render network icon matching about_view.dart -->
                <img
                  v-if="social.logo"
                  :src="social.logo"
                  :alt="social.title"
                  class="w-full h-full object-contain filter invert group-hover/soc:scale-110 transition-transform"
                />
                <template v-else>
                  <Instagram v-if="social.title?.toLowerCase().includes('instagram')" class="w-3.5 h-3.5" />
                  <Facebook v-else-if="social.title?.toLowerCase().includes('facebook')" class="w-3.5 h-3.5 fill-white" />
                  <Twitter v-else-if="social.title?.toLowerCase().includes('twitter')" class="w-3.5 h-3.5 fill-white" />
                  <Youtube v-else-if="social.title?.toLowerCase().includes('youtube')" class="w-3.5 h-3.5 fill-white" />
                  <svg v-else class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.32 0 .62.05.9.15v-3.55a6.38 6.38 0 0 0-.9-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.08a8.28 8.28 0 0 0 3.76.92V6.69z"/>
                  </svg>
                </template>
              </a>
            </div>
          </div>

          <!-- Official Contact Info (Aligned with about_view.dart) -->
          <div class="pt-2 border-t border-gray-200/80 space-y-1.5 text-[11px] text-gray-600">
            <div class="flex items-center gap-2">
              <Phone class="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <a :href="`tel:+62${phone}`" class="hover:text-[#2563EB] font-medium transition-colors">
                (+62) {{ formattedPhone }}
              </a>
            </div>
            <div class="flex items-center gap-2">
              <Mail class="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <a :href="`mailto:${email}`" class="hover:text-[#2563EB] font-medium transition-colors">
                {{ email }}
              </a>
            </div>
            <div class="flex items-start gap-2">
              <Clock class="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
              <span class="text-gray-500">{{ workingHour }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Bottom Legal & Copyright Bar -->
      <div class="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p class="text-center sm:text-left">
          &copy; 2026 <strong class="text-gray-700">PT Jantaka Ladang Unggul</strong>. Marketplace Jual Beli Barang Bekas &amp; Preloved Terpercaya.
        </p>

        <div class="flex items-center gap-4 text-gray-500 text-xs">
          <NuxtLink to="/terms" class="hover:text-[#2563EB] transition-colors">
            Ketentuan Layanan
          </NuxtLink>
          <span class="text-gray-300">•</span>
          <NuxtLink to="/privacy" class="hover:text-[#2563EB] transition-colors">
            Kebijakan Privasi
          </NuxtLink>
          <span class="text-gray-300">•</span>
          <span class="flex items-center gap-1 text-[#16A34A] font-semibold">
            <ShieldCheck class="w-3.5 h-3.5" />
            <span>Garansi Rekber</span>
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Apple,
  Phone,
  Mail,
  Clock,
} from 'lucide-vue-next'
import { PLAY_STORE_URL, APP_STORE_URL } from '~/utils/constants'
import { useFooterPartners } from '~/composables/useFooterPartners'

interface SocmedItem {
  _id?: string
  logo?: string
  title?: string
  description?: string
  link?: string
}

const api = useApi()
const { paymentMethods, couriers } = useFooterPartners()

const socmedList = ref<SocmedItem[]>([
  {
    title: 'instagram',
    description: '@bekasku.id',
    link: 'https://www.instagram.com/bekasku.id/',
    logo: 'https://api.bekasku.id/v1/images/instagram.png',
  },
  {
    title: 'facebook',
    description: 'bekasku.id',
    link: 'https://www.facebook.com/bekasku.id/',
    logo: 'https://api.bekasku.id/v1/images/facebook.png',
  },
  {
    title: 'twitter',
    description: '@bekasku.id',
    link: 'https://x.com/bekasku.id',
    logo: 'https://api.bekasku.id/v1/images/twitter.png',
  },
  {
    title: 'Youtube',
    description: 'bekasku.id chn',
    link: 'https://www.youtube.com/@bekasku.id',
    logo: 'https://api.bekasku.id/v1/images/youtube.png',
  },
  {
    title: 'Tik tok',
    description: '@bekasku.id',
    link: 'https://www.tiktok.com/@bekasku.id',
    logo: 'https://api.bekasku.id/v1/images/tiktok.png',
  },
])

const phone = ref('82294588970')
const email = ref('info@bekasku.id')
const workingHour = ref('Senin - Sabtu, 10:00 - 17:00')

const formattedPhone = computed(() => {
  const p = phone.value.replace(/\D/g, '')
  if (p.startsWith('8') && p.length >= 10) {
    return `${p.substring(0, 3)}-${p.substring(3, 7)}-${p.substring(7)}`
  }
  return phone.value
})

onMounted(async () => {
  try {
    const res = await api.post<{
      message?: string
      result?: {
        socmed?: SocmedItem[]
        phone?: string
        email?: string
        working_hour?: string
      }
    }>('/socmed', { lang: 'id' })

    if (res?.result?.socmed && res.result.socmed.length > 0) {
      socmedList.value = res.result.socmed
    }
    if (res?.result?.phone) phone.value = res.result.phone
    if (res?.result?.email) email.value = res.result.email
    if (res?.result?.working_hour) workingHour.value = res.result.working_hour
  } catch (err) {
    console.warn('[AppFooter] Error loading /socmed:', err)
  }
})

function onImgError(e: Event, fallbackText: string) {
  const target = e.target as HTMLImageElement
  if (target && !target.dataset.failed) {
    target.dataset.failed = 'true'
    target.style.display = 'none'
    const parent = target.parentElement
    if (parent) {
      const span = document.createElement('span')
      span.className = 'text-[9px] font-bold text-gray-700 truncate max-w-full'
      span.innerText = fallbackText
      parent.appendChild(span)
    }
  }
}
</script>

