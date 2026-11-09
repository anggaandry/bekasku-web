<template>
  <div class="min-h-screen bg-surface-2 flex flex-col justify-between font-outfit py-8 sm:py-16">
    <div class="max-w-xl mx-auto px-4 w-full text-center space-y-6">
      <!-- Success Icon -->
      <div class="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs animate-in zoom-in-75 duration-300">
        <CheckCircle2 class="w-10 h-10" />
      </div>

      <!-- Title & Message -->
      <div class="space-y-2">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-text-primary">
          {{ isEdit ? 'Iklan Berhasil Diperbarui!' : 'Iklan Berhasil Diterbitkan!' }}
        </h1>
        <p class="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
          {{
            isEdit
              ? 'Perubahan produk kamu telah disimpan dan informasi terbaru sudah langsung tayang.'
              : 'Iklan kamu sekarang aktif dan dapat ditemukan oleh pembeli di BekasKu.'
          }}
        </p>
      </div>

      <!-- Tips Box -->
      <div class="bg-white rounded-2xl border border-border-light p-5 text-left space-y-3 shadow-xs">
        <div class="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wider">
          <Sparkles class="w-4 h-4 text-primary" />
          <span>Tips Penjual Cepat Laku</span>
        </div>

        <ul class="space-y-2 text-xs text-text-secondary leading-relaxed">
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
            <span>Respon chat dari calon pembeli secepat mungkin untuk menaikkan reputasi tokomu.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
            <span>Gunakan fitur <strong>Sundul Iklan</strong> secara berkala agar produk selalu di posisi teratas.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
            <span>Bagikan link tokomu ke WhatsApp dan media sosial untuk mendatangkan lebih banyak pembeli.</span>
          </li>
        </ul>
      </div>

      <!-- Action CTAs -->
      <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <NuxtLink
          to="/catalog"
          class="w-full sm:flex-1 py-3 px-6 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
        >
          <Package class="w-4 h-4" />
          <span>Lihat Iklan Saya</span>
        </NuxtLink>

        <NuxtLink
          to="/post/sell"
          class="w-full sm:flex-1 py-3 px-6 bg-white hover:bg-surface-3 text-text-primary border border-border-light text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
        >
          <Plus class="w-4 h-4" />
          <span>Pasang Iklan Lain</span>
        </NuxtLink>
      </div>

      <div>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Kembali ke Beranda BekasKu</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { CheckCircle2, Sparkles, Package, Plus, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const isEdit = computed(() => route.query.mode === 'edit')

useHead({
  title: isEdit.value ? 'Iklan Berhasil Diperbarui — BekasKu' : 'Iklan Berhasil Diterbitkan — BekasKu',
  meta: [
    {
      name: 'description',
      content: 'Iklan produk Anda telah berhasil diterbitkan dan siap dilihat calon pembeli di BekasKu.',
    },
  ],
})
</script>

