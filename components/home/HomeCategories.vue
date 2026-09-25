<template>
  <div class="flex flex-col h-full justify-between">
    <!-- 2-Row Category Track Container (No white border card surrounding it) -->
    <div class="flex-1 flex items-center">
      <!-- Scrollable Track: 2 Rows Grid Flow Col -->
      <div
        ref="catScrollRef"
        class="w-full grid grid-rows-2 grid-flow-col auto-cols-max gap-x-4 sm:gap-x-5 gap-y-3 sm:gap-y-3.5 overflow-x-auto scroll-smooth no-scrollbar py-1 select-none"
        @scroll="handleScroll"
      >
        <!-- Loading Skeletons matching Mobile V3 -->
        <template v-if="loading">
          <div
            v-for="i in 14"
            :key="`cat-skel-${i}`"
            class="flex flex-col items-center shrink-0 w-20 sm:w-22 space-y-1.5 animate-shimmer"
          >
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-200" />
            <div class="w-14 h-3 rounded bg-gray-200" />
          </div>
        </template>

        <!-- Real Categories from API / Fallback -->
        <template v-else>
          <div
            v-for="cat in displayCategories"
            :key="cat.id || cat._id"
            class="group/item flex flex-col items-center shrink-0 w-20 sm:w-22 cursor-pointer transition-transform duration-200 active:scale-95"
            @click="handleCategoryClick(cat)"
          >
            <!-- Circle Container (Enlarged) -->
            <div
              class="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F4F5F7] hover:bg-red-50/50 flex items-center justify-center p-2.5 sm:p-3 border border-gray-200/70 shadow-2xs group-hover/item:border-[#E31B23]/40 group-hover/item:scale-108 group-hover/item:shadow-md transition-all duration-300"
              :class="{
                'ring-2 ring-[#E31B23] ring-offset-2 border-transparent bg-red-50': activeCategory === cat.name
              }"
            >
              <!-- Category Real Image -->
              <img
                v-if="cat.image"
                :src="cat.image"
                :alt="cat.name"
                class="w-full h-full object-contain pointer-events-none group-hover/item:scale-105 transition-transform duration-300"
                loading="lazy"
                @error="onImageError(cat)"
              />

              <!-- Fallback Icon if no image -->
              <LayoutGrid
                v-else
                class="w-6 h-6 text-gray-400 group-hover/item:text-[#E31B23] transition-colors"
              />
            </div>

            <!-- Category Label underneath (2-line clean wrap, no truncation) -->
            <span
              class="font-outfit text-[11px] sm:text-xs font-semibold text-gray-800 group-hover/item:text-[#E31B23] text-center line-clamp-2 leading-tight mt-1.5 transition-colors max-w-full h-8 flex items-center justify-center px-1"
              :class="{
                'text-[#E31B23] font-bold': activeCategory === cat.name
              }"
            >
              {{ cat.name }}
            </span>
          </div>
        </template>
      </div>
    </div>

    <!-- Centered Bottom Navigation Controls (Panah Kiri Kanan & Dots di Tengah) -->
    <div class="flex items-center justify-center gap-2 pt-2 pb-0.5">
      <button
        type="button"
        class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        :disabled="!canScrollLeft"
        title="Kategori sebelumnya"
        aria-label="Kategori sebelumnya"
        @click="scrollPrev"
      >
        <ChevronLeft class="w-4 h-4 stroke-[2.2]" />
      </button>

      <!-- Dots Progress Indicator -->
      <div v-if="totalDots > 1" class="flex items-center gap-1.5 px-1">
        <button
          v-for="idx in totalDots"
          :key="`cat-dot-${idx}`"
          type="button"
          class="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
          :class="activeDot === (idx - 1) ? 'w-5 sm:w-6 bg-gray-900' : 'w-1.5 bg-gray-300 hover:bg-gray-400'"
          :aria-label="`Halaman kategori ${idx}`"
          @click="scrollToDot(idx - 1)"
        />
      </div>

      <button
        type="button"
        class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        :disabled="!canScrollRight"
        title="Kategori selanjutnya"
        aria-label="Kategori selanjutnya"
        @click="scrollNext"
      >
        <ChevronRight class="w-4 h-4 stroke-[2.2]" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-vue-next'
import type { Category } from '~/composables/useCategories'
import { useCategories } from '~/composables/useCategories'

interface Props {
  categories?: Category[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
  loading: false,
})

const route = useRoute()
const { categories: fetchedCategories, fetchCategories } = useCategories()

// Active category query from URL
const activeCategory = computed(() => (route.query.category as string) || '')

// Curated high-res production fallback categories matching mobile v3
const fallbackCategories: Category[] = [
  {
    id: 'fesyen_wanita',
    name: 'Fesyen Wanita',
    image: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565020607-07_Fesyen_Wanita.png?alt=media&token=a317bfc9-ae17-4bbf-b683-59fe6c556c65',
  },
  {
    id: 'fesyen_pria',
    name: 'Fesyen Pria',
    image: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565035092-08_Fesyen_Pria.png?alt=media&token=eea14aae-8799-4c76-87b2-98c82aeec5b6',
  },
  {
    id: 'elektronik',
    name: 'Barang Elektronik',
    image: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565311039-04_Barang_Elektronik.png?alt=media&token=257065fd-465b-4239-8b3d-1e4bc4407a45',
  },
  {
    id: 'ponsel_tablet',
    name: 'Ponsel & Tablet',
    image: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565241953-02_Ponsel_dan_Tablet.png?alt=media&token=b97225cc-8eaf-40e0-91dd-e9575d0f3c98',
  },
  {
    id: 'video_game',
    name: 'Video Game',
    image: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565375013-15_Video_Game.png?alt=media&token=88f55b45-7cc1-4793-a66c-74facab26086',
  },
  {
    id: 'mewah',
    name: 'Mewah',
    image: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781568108145-Gemini_Generated_Image_sml1c4sml1c4sml1__1_-removebg-preview.png?alt=media&token=07070c24-79da-4331-808d-2142d25524eb',
  },
  {
    id: 'anak_bayi',
    name: 'Anak & Bayi',
    image: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565215646-11_Anak_dan_Bayi_a.png?alt=media&token=d55e5693-8424-4995-9bf6-3b449f2cbe37',
  },
  {
    id: 'mainan',
    name: 'Mainan',
    image: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565259181-12_Anak_dan_Bayi_b.png?alt=media&token=567f9b8c-3d2c-418a-ac2e-9e4cc94bd390',
  },
  {
    id: 'perhiasan',
    name: 'Perhiasan',
    image: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565280694-03_Perhiasan.png?alt=media&token=8e5caa31-7b92-44fc-b9a8-6eaf90763420',
  },
  {
    id: 'mobil',
    name: 'Mobil',
    image: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565345271-13_Mobil.png?alt=media&token=be021b2a-9fa0-46a2-8a60-7fdbd1f89daf',
  },
  {
    id: 'motor',
    name: 'Motor',
    image: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1755747583705-s-blob-v1-IMAGE-zdfSBqMqKmw.png?alt=media&token=2cd3f36b-55bc-426b-80c5-39cb9e9b0c85',
  },
  {
    id: 'properti',
    name: 'Properti',
    image: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565333688-06_Properti.png?alt=media&token=92547e6e-0fb8-43ea-bed0-871fb173719c',
  },
]

const displayCategories = computed<Category[]>(() => {
  const source = (props.categories && props.categories.length > 0)
    ? props.categories
    : fetchedCategories.value

  if (source && source.length > 0) {
    return source
  }
  return fallbackCategories
})

// Scroll Navigation & Dots
const catScrollRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)
const showArrows = ref(false)
const activeDot = ref(0)
const totalDots = ref(4)

function updateDots() {
  const el = catScrollRef.value
  if (!el) return
  const maxScroll = el.scrollWidth - el.clientWidth
  if (maxScroll <= 0) {
    totalDots.value = 1
    activeDot.value = 0
    return
  }

  // Set number of dots based on content width (min 3, max 5)
  const dotsCount = Math.max(3, Math.min(5, Math.ceil(el.scrollWidth / el.clientWidth)))
  totalDots.value = dotsCount

  const progress = Math.max(0, Math.min(1, el.scrollLeft / maxScroll))
  activeDot.value = Math.min(dotsCount - 1, Math.round(progress * (dotsCount - 1)))
}

function handleScroll() {
  const el = catScrollRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 6
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 6
  updateDots()
}

function scrollNext() {
  const el = catScrollRef.value
  if (!el) return
  const step = Math.max(260, el.clientWidth * 0.75)
  el.scrollBy({ left: step, behavior: 'smooth' })
}

function scrollPrev() {
  const el = catScrollRef.value
  if (!el) return
  const step = Math.max(260, el.clientWidth * 0.75)
  el.scrollBy({ left: -step, behavior: 'smooth' })
}

function scrollToDot(dotIndex: number) {
  const el = catScrollRef.value
  if (!el || totalDots.value <= 1) return
  const maxScroll = el.scrollWidth - el.clientWidth
  const targetScroll = (dotIndex / (totalDots.value - 1)) * maxScroll
  el.scrollTo({ left: targetScroll, behavior: 'smooth' })
}

function handleCategoryClick(cat: Category) {
  if (activeCategory.value === cat.name) {
    navigateTo({ path: '/', query: {} })
  } else {
    navigateTo({
      path: '/',
      query: { category: cat.name },
    })
  }
}

function onImageError(cat: Category) {
  cat.image = ''
}

watch(displayCategories, () => {
  nextTick(() => {
    handleScroll()
  })
})

onMounted(() => {
  if (props.categories.length === 0 && fetchedCategories.value.length === 0) {
    fetchCategories()
  }
  nextTick(() => {
    handleScroll()
  })
})
</script>
