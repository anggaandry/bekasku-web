<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 font-['Poppins'] flex flex-col selection:bg-[#2563eb] selection:text-white">
    <!-- Top Bar -->
    <header class="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <img
            src="/images/icon_only.png"
            alt="Bekasku Icon"
            class="h-8 w-auto object-contain"
          />
          <span class="text-xl sm:text-2xl font-bold tracking-tight text-[#2563eb]">Bekasku</span>
        </NuxtLink>

        <!-- CTA Buka Aplikasi -->
        <div class="flex items-center gap-2.5">
          <button
            @click="openNativeApp"
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Smartphone class="w-4 h-4" />
            <span>Buka di Aplikasi</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Notification Banner (Auto Launch Status) -->
    <div v-if="launchingApp" class="bg-blue-600 text-white text-xs sm:text-sm py-2.5 px-4 text-center flex items-center justify-center gap-2 animate-pulse">
      <Smartphone class="w-4 h-4" />
      <span>Membuka aplikasi BekasKu... Jika aplikasi belum terbuka, klik tombol di bawah.</span>
    </div>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-grow w-full">
      
      <!-- Back Navigation -->
      <div class="mb-4">
        <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-[#2563eb] transition-colors">
          <ArrowLeft class="w-4 h-4" />
          <span>Kembali ke Beranda Bekasku</span>
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
        <div class="inline-block w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm text-slate-600">Memuat rincian produk...</p>
      </div>

      <!-- Product Card Container -->
      <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        <!-- Left: Image Gallery (5 cols on desktop) -->
        <div class="md:col-span-6 space-y-3">
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative aspect-square flex items-center justify-center bg-slate-50">
            <img
              :src="currentImage"
              :alt="product.title"
              class="w-full h-full object-cover"
              loading="eager"
            />
            <div v-if="product.condition" class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm">
              {{ product.condition }}
            </div>
          </div>

          <!-- Thumbnail Selectors (if multi-image) -->
          <div v-if="product.images && product.images.length > 1" class="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              v-for="(img, idx) in product.images"
              :key="idx"
              @click="selectedImageIdx = idx"
              class="w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all"
              :class="selectedImageIdx === idx ? 'border-[#2563eb] shadow-sm scale-95' : 'border-slate-200 opacity-70 hover:opacity-100'"
            >
              <img :src="img" :alt="product.title" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Right: Product Information & CTAs (7 cols on desktop) -->
        <div class="md:col-span-6 space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
            
            <!-- Title & Price -->
            <div class="space-y-2 border-b border-slate-100 pb-5">
              <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-[#2563eb] inline-block mb-1">
                Produk Bekasku
              </span>
              <h1 class="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {{ product.title }}
              </h1>
              <div class="pt-1">
                <span class="text-2xl sm:text-3xl font-bold text-[#2563eb]">
                  {{ formatRupiah(product.price) }}
                </span>
              </div>
            </div>

            <!-- Seller Info & Location -->
            <div class="flex items-center justify-between gap-4 py-2 border-b border-slate-100 pb-4">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-full bg-blue-100 text-[#2563eb] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                  <img v-if="product.seller_avatar" :src="product.seller_avatar" :alt="product.seller_name" class="w-full h-full object-cover" />
                  <Store v-else class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-slate-400">Penjual</p>
                  <p class="text-sm font-semibold text-slate-800 truncate">{{ product.seller_name }}</p>
                </div>
              </div>

              <div class="text-right shrink-0">
                <p class="text-xs text-slate-400 flex items-center justify-end gap-1">
                  <MapPin class="w-3.5 h-3.5 text-slate-400" />
                  Lokasi
                </p>
                <p class="text-xs sm:text-sm font-medium text-slate-700">{{ product.location || 'Indonesia' }}</p>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Deskripsi Barang</h3>
              <p class="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto pr-1">
                {{ product.description || 'Tidak ada deskripsi rinci untuk barang ini. Buka aplikasi BekasKu untuk info lengkap dan chat langsung dengan penjual.' }}
              </p>
            </div>

            <!-- Primary Action: Open in App -->
            <div class="pt-2 space-y-3">
              <button
                @click="openNativeApp"
                class="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all active:scale-98"
              >
                <ShoppingBag class="w-5 h-5" />
                <span>Beli / Buka di Aplikasi BekasKu</span>
              </button>

              <p class="text-[11px] text-center text-slate-500">
                Transaksi aman dilindungi Sistem Rekber (Rekening Bersama) resmi BekasKu.
              </p>
            </div>

          </div>

          <!-- App Download Section (If user doesn't have app) -->
          <div class="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-5 sm:p-6 text-white space-y-4 shadow-md">
            <div class="space-y-1">
              <h3 class="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Download class="w-4 h-4 text-blue-400" />
                Belum Memiliki Aplikasi BekasKu?
              </h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Download gratis sekarang untuk menikmati penawaran harga, chat langsung, dan transaksi aman dengan proteksi garansi uang kembali.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3 pt-1">
              <!-- Play Store -->
              <a
                :href="config.public.playStoreUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition-colors"
              >
                <Smartphone class="w-4 h-4 text-emerald-400" />
                <span>Google Play</span>
              </a>

              <!-- App Store -->
              <a
                :href="config.public.appStoreUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition-colors"
              >
                <Smartphone class="w-4 h-4 text-blue-400" />
                <span>App Store</span>
              </a>
            </div>
          </div>

        </div>

      </div>

    </main>

    <!-- Footer -->
    <footer class="w-full bg-white border-t border-slate-200 py-6 text-xs text-center text-slate-500">
      <div class="max-w-5xl mx-auto px-4 space-y-2">
        <p>&copy; {{ new Date().getFullYear() }} Bekasku. Jual Beli Barang Bekas &amp; Preloved Terpercaya.</p>
        <div class="flex items-center justify-center gap-4 text-slate-400">
          <NuxtLink to="/" class="hover:text-slate-700">Beranda</NuxtLink>
          <span>&bull;</span>
          <NuxtLink to="/terms" class="hover:text-slate-700">Syarat &amp; Ketentuan</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRuntimeConfig, useSeoMeta, useHead } from '#imports';
import { Smartphone, ShoppingBag, Store, MapPin, ArrowLeft, Download } from 'lucide-vue-next';

const route = useRoute();
const config = useRuntimeConfig();
const productId = route.params.id || '';
const selectedImageIdx = ref(0);
const launchingApp = ref(false);

// Fallback Default Data jika offline / belum ada DB
const fallbackProduct = {
  _id: productId,
  title: 'Barang Preloved di BekasKu',
  price: 0,
  description: 'Lihat rincian lengkap barang ini dan lakukan transaksi aman langsung di aplikasi BekasKu.',
  images: ['/images/product_detail.png'],
  location: 'Indonesia',
  seller_name: 'Penjual BekasKu',
  seller_avatar: '',
  condition: 'Bekas Terawat'
};

// Fetch data dari API Backend Bekasku
const apiBase = config.public.apiBase || 'https://api.bekasku.id';
const { data: apiData, pending } = await useFetch(`${apiBase}/product/public/detail/${productId}`, {
  key: `product-${productId}`,
  lazy: true,
  server: true,
  default: () => null
});

const product = computed(() => {
  if (apiData.value && apiData.value.result) {
    const res = apiData.value.result;
    return {
      _id: res._id || productId,
      title: res.title || fallbackProduct.title,
      price: res.price || 0,
      description: res.description || fallbackProduct.description,
      images: Array.isArray(res.images) && res.images.length > 0 ? res.images : (res.image ? [res.image] : fallbackProduct.images),
      location: res.location || fallbackProduct.location,
      seller_name: res.seller_name || fallbackProduct.seller_name,
      seller_avatar: res.seller_avatar || '',
      condition: res.condition || fallbackProduct.condition
    };
  }
  return fallbackProduct;
});

const currentImage = computed(() => {
  const imgs = product.value.images || [];
  return imgs[selectedImageIdx.value] || imgs[0] || '/images/product_detail.png';
});

// Dynamic SEO / Open Graph Meta Tags (Untuk Share WhatsApp/Telegram yang Elegan)
useSeoMeta({
  title: () => `${product.value.title} — BekasKu`,
  description: () => `${formatRupiah(product.value.price)} - ${product.value.description ? product.value.description.slice(0, 150) : 'Jual beli barang bekas terpercaya di BekasKu'}.`,
  ogTitle: () => `${product.value.title} — BekasKu`,
  ogDescription: () => `${formatRupiah(product.value.price)} • Lokasi: ${product.value.location}. Beli aman di BekasKu.`,
  ogImage: () => currentImage.value,
  ogUrl: () => `https://bekasku.id/product/${productId}`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: () => `${product.value.title} — BekasKu`,
  twitterDescription: () => `${formatRupiah(product.value.price)} • Beli aman di aplikasi BekasKu.`,
  twitterImage: () => currentImage.value,
});

useHead({
  link: [
    { rel: 'canonical', href: `https://bekasku.id/product/${productId}` }
  ]
});

function formatRupiah(val) {
  if (!val || val <= 0) return 'Hubungi Penjual';
  return 'Rp ' + Number(val).toLocaleString('id-ID');
}

function openNativeApp() {
  const appUri = `bekasku://product/${productId}`;
  const playStore = config.public.playStoreUrl;
  const appStore = config.public.appStoreUrl;
  
  launchingApp.value = true;
  
  // 1. Coba buka Native URI Scheme
  window.location.href = appUri;

  // 2. Fallback timeout: Jika dalam 1.8 detik browser masih aktif (aplikasi belum terinstall)
  setTimeout(() => {
    launchingApp.value = false;
  }, 2000);
}

// Auto-trigger saat pertama kali dibuka di mobile browser
onMounted(() => {
  if (import.meta.client) {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      openNativeApp();
    }
  }
});
</script>
