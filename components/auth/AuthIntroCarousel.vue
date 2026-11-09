<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface IntroSlide {
  image: string
  title: string
  description: string
}

const SLIDES: IntroSlide[] = [
  {
    image: '/images/auth/intro_mascot1.png',
    title: 'Jelajahi Barang Berkualitas dengan Harga Terbaik',
    description:
      'Temukan ribuan barang bekas berkualitas yang telah dikurasi dengan harga ramah di kantong.',
  },
  {
    image: '/images/auth/v3intro2.png',
    title: 'Jual Barang Tidak Terpakai dengan Mudah',
    description:
      'Ubah barang tak terpakai di rumah menjadi uang tunai hanya dalam beberapa langkah cepat.',
  },
  {
    image: '/images/auth/v3intro3.png',
    title: 'Transaksi Aman dengan Rekening Bersama',
    description:
      'Dana pembeli terlindungi 100% dan baru diteruskan ke penjual setelah barang diterima dengan aman.',
  },
]

const activeIndex = ref(0)
const isPaused = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const currentSlide = computed(() => SLIDES[activeIndex.value] || SLIDES[0])

function nextSlide() {
  activeIndex.value = (activeIndex.value + 1) % SLIDES.length
}

function prevSlide() {
  activeIndex.value = (activeIndex.value - 1 + SLIDES.length) % SLIDES.length
}

function goToSlide(idx: number) {
  activeIndex.value = idx
}

onMounted(() => {
  timer = setInterval(() => {
    if (!isPaused.value) nextSlide()
  }, 4500)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div
    class="relative flex flex-col justify-between h-full w-full bg-white p-7 lg:p-8 select-none overflow-hidden border-r border-border"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
  >
    <!-- Top Brand Logo (Transparent, No Badge) -->
    <div class="relative z-10 flex items-center">
      <img
        src="/images/logo_red.png"
        alt="BekasKu"
        width="124"
        height="32"
        class="h-7 lg:h-8 w-auto object-contain"
      />
    </div>

    <!-- Center Illustration & Copy -->
    <div class="relative z-10 my-auto py-4 flex flex-col items-center text-center">
      <div class="w-52 h-52 lg:w-60 lg:h-60 flex items-center justify-center">
        <img
          :key="currentSlide.image"
          :src="currentSlide.image"
          :alt="currentSlide.title"
          width="240"
          height="240"
          class="w-48 h-48 lg:w-56 lg:h-56 object-contain transition-all duration-300"
        />
      </div>

      <h3 class="mt-4 text-lg lg:text-xl font-bold text-text font-outfit leading-snug max-w-[320px]">
        {{ currentSlide.title }}
      </h3>
      <p class="mt-2 text-xs lg:text-[13px] text-text-muted leading-relaxed max-w-[320px]">
        {{ currentSlide.description }}
      </p>
    </div>

    <!-- Bottom Controls: Pill Dots + Prev/Next -->
    <div class="relative z-10 flex items-center justify-between pt-3">
      <div class="flex items-center gap-1.5" role="tablist" aria-label="Slide Intro BekasKu">
        <button
          v-for="(slide, idx) in SLIDES"
          :key="slide.title"
          type="button"
          role="tab"
          :aria-selected="activeIndex === idx"
          :aria-label="`Slide ${idx + 1}: ${slide.title}`"
          class="h-2 rounded-full transition-all duration-300 cursor-pointer"
          :class="activeIndex === idx ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-text-muted/40'"
          @click="goToSlide(idx)"
        />
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors cursor-pointer"
          aria-label="Slide sebelumnya"
          @click="prevSlide"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button
          type="button"
          class="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors cursor-pointer"
          aria-label="Slide berikutnya"
          @click="nextSlide"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
