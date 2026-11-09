<script setup lang="ts">
import { computed } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const authStore = useAuthStore()

const firstName = computed(() => {
  const fullName = String(authStore.user?.name || '').trim()
  if (!fullName) return 'Kak'
  return fullName.split(/\s+/)[0] || 'Kak'
})

function onInput(ev: Event) {
  const target = ev.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function clearSearch() {
  emit('update:modelValue', '')
}
</script>

<template>
  <section class="relative mb-10 md:mb-12">
    <div class="relative bg-primary overflow-hidden pt-7 pb-14 md:pt-10 md:pb-16">
      <!-- Decorative Right Pattern & Illustration (matching faq_view.dart) -->
      <img
        src="/images/help/faq-pattern.png"
        alt=""
        aria-hidden="true"
        width="260"
        height="220"
        class="pointer-events-none select-none absolute right-0 top-4 h-[175px] md:h-[225px] w-auto object-contain opacity-95"
      />
      <img
        src="/images/help/faq-illust.png"
        alt="Ilustrasi Pusat Bantuan BekasKu"
        width="170"
        height="170"
        loading="eager"
        fetchpriority="high"
        class="pointer-events-none select-none absolute right-2 sm:right-6 md:right-12 bottom-5 h-[112px] sm:h-[135px] md:h-[168px] w-auto object-contain"
      />

      <div class="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <div class="max-w-[66%] sm:max-w-lg md:max-w-xl">
          <img
            src="/images/help/faq-logo.png"
            alt="BekasKu"
            width="136"
            height="40"
            class="h-8 md:h-10 w-auto object-contain mb-4 md:mb-5"
          />
          <h1 class="font-outfit font-bold text-xl sm:text-2xl md:text-3xl text-white leading-snug tracking-tight">
            Halo, {{ firstName }}. Lagi perlu bantuan apa?
          </h1>
          <p class="hidden sm:block font-outfit text-xs md:text-sm text-white/90 mt-2 max-w-lg leading-relaxed">
            Cari panduan transaksi, metode bayar, pengiriman, komplain barang, atau hubungi BekasKu Center.
          </p>
        </div>
      </div>
    </div>

    <!-- Overlapping Search Input Card (matching faq_view.dart bottom: -28px) -->
    <div class="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7">
      <div class="max-w-3xl bg-white rounded-xl md:rounded-2xl border border-border-light shadow-lg px-3.5 md:px-4 flex items-center gap-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Search class="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
        <input
          id="help-search-input"
          name="q"
          :value="props.modelValue"
          type="search"
          aria-label="Cari topik bantuan"
          placeholder="Cari topik bantuan (contoh: rekber, komplain, pembayaran, resi)..."
          class="w-full h-12 md:h-14 bg-transparent font-outfit text-sm md:text-base text-text placeholder:text-text-muted outline-hidden"
          @input="onInput"
        />
        <button
          v-if="props.modelValue"
          type="button"
          class="min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center rounded-full text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
          aria-label="Hapus kata kunci"
          @click="clearSearch"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </section>
</template>

