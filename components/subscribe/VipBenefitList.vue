<script setup lang="ts">
import {
  Layers,
  EyeOff,
  Sparkles,
  BrainCircuit,
  Crown,
  Image as ImageIcon,
  Video,
  Headphones,
} from 'lucide-vue-next'

defineProps<{
  isVipActive?: boolean
}>()

// 8 Benefit resmi sesuai choose_subscribe_view.dart (_buildBenefitSection)
const benefits = [
  {
    icon: Layers,
    title: 'Listing Aktif Tanpa Batas',
    subtitle: 'Bebas posting produk sepuasnya tanpa batasan kuota listing aktif.',
  },
  {
    icon: EyeOff,
    title: 'Bebas dari Iklan',
    subtitle: 'Nikmati kenyamanan menjelajah aplikasi tanpa ada gangguan iklan.',
  },
  {
    icon: Sparkles,
    title: 'AI Post Tanpa Batas',
    subtitle: 'Buat deskripsi produk menarik secara otomatis menggunakan AI setiap hari sepuasnya.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Analytic Tanpa Batas',
    subtitle: 'Dapatkan analisis cerdas untuk optimasi penjualan tokomu kapan saja tanpa limit.',
  },
  {
    icon: Crown,
    title: 'Badge VIP Penjual & Produk',
    subtitle:
      'Dapatkan emblem VIP eksklusif pada halaman profil tokomu serta di setiap listing produkmu pada hasil pencarian.',
  },
  {
    icon: ImageIcon,
    title: 'Upload 20 Foto per Listing',
    subtitle: 'Tunjukkan detail lengkap produkmu dengan batas unggah hingga 20 foto per listing.',
  },
  {
    icon: Video,
    title: 'Dukung Video di Listing',
    subtitle: 'Tambahkan video produk untuk memberikan gambaran yang lebih nyata ke pembeli.',
  },
  {
    icon: Headphones,
    title: 'Layanan CS Prioritas',
    subtitle: 'Dapatkan bantuan khusus lebih cepat dari tim Customer Service prioritas VIP.',
  },
]
</script>

<template>
  <section class="space-y-4 font-outfit">
    <h2 class="text-base sm:text-lg font-bold text-text">
      {{ isVipActive ? 'Benefit Aktif' : 'Benefit Langganan' }}
    </h2>

    <!-- Mobile (< md): List vertikal persis Gambar 3; Desktop (md+): Grid 2 kolom kartu rapi -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-4">
      <div
        v-for="item in benefits"
        :key="item.title"
        class="flex items-start gap-4 md:p-4 md:rounded-2xl md:bg-surface-2/60 md:border md:border-border/70 transition-colors"
      >
        <div class="shrink-0 mt-0.5 text-primary">
          <component :is="item.icon" class="w-6 h-6 stroke-[2]" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1 space-y-1">
          <h3 class="text-sm sm:text-[15px] font-bold text-text leading-snug">
            {{ item.title }}
          </h3>
          <p class="text-xs sm:text-[13px] text-text-muted leading-relaxed">
            {{ item.subtitle }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

