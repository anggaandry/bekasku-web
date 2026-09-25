<template>
  <div class="space-y-3.5">
    <!-- Header Row matching Mobile V3 / home_red.png -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5 sm:gap-3 flex-wrap">
        <!-- Title "Best Deal" (Mobile V3 Typography) -->
        <h3 class="font-outfit text-base sm:text-lg md:text-xl font-bold text-gray-900 tracking-tight">
          Best Deal
        </h3>

        <!-- Countdown Timer: Red Box matching home_red.png (08:38:11) -->
        <div class="bg-[#E31B23] text-white text-xs font-bold font-mono px-2.5 py-1 rounded-md flex items-center gap-1 shadow-xs tracking-wider">
          <span>{{ formatDigit(hours) }}</span>
          <span class="text-white/80">:</span>
          <span>{{ formatDigit(minutes) }}</span>
          <span class="text-white/80">:</span>
          <span>{{ formatDigit(seconds) }}</span>
        </div>
      </div>

      <!-- Right Link "Lihat semua" in Red -->
      <NuxtLink
        to="/product/search?type=2"
        class="font-outfit text-xs sm:text-sm font-semibold text-[#E31B23] hover:text-[#b8141b] flex items-center gap-1 transition-colors"
      >
        <span>Lihat semua</span>
        <ChevronRight class="w-4 h-4" />
      </NuxtLink>
    </div>

    <!-- Product Slider / Horizontal Scroll with Side Arrows -->
    <div
      class="relative group/bd select-none"
      @mouseenter="showArrows = true"
      @mouseleave="showArrows = false"
    >
      <!-- Scrollable Track with Reusable AppProductCard -->
      <div
        ref="bdScrollRef"
        class="flex gap-3 sm:gap-3.5 overflow-x-auto scroll-smooth scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-1 snap-x snap-mandatory"
        @scroll="updateScrollStatus"
      >
        <!-- Shimmer Skeletons when loading matching Mobile V3 -->
        <template v-if="loading">
          <div
            v-for="i in 5"
            :key="`bd-skel-${i}`"
            class="snap-start shrink-0 w-40 sm:w-44 md:w-48 lg:w-52 rounded-xl bg-white border border-gray-100 p-2 space-y-2 animate-shimmer shadow-2xs"
          >
            <div class="w-full aspect-square bg-gray-200 rounded-lg" />
            <div class="h-3.5 bg-gray-200 rounded w-2/3" />
            <div class="h-3 bg-gray-200 rounded w-full" />
            <div class="h-2.5 bg-gray-100 rounded w-1/2" />
          </div>
        </template>

        <!-- Real Products from Production using Global Reusable AppProductCard -->
        <template v-else>
          <AppProductCard
            v-for="item in displayProducts"
            :key="item.id || item._id"
            :product="item"
            class="snap-start shrink-0 w-40 sm:w-44 md:w-48 lg:w-52"
            @click="handleClick(item)"
          />
        </template>
      </div>

      <!-- Left Arrow Button -->
      <button
        type="button"
        class="absolute -left-2 sm:-left-3 top-[42%] -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-gray-800 border border-gray-200 shadow-md flex items-center justify-center transition-all hover:scale-108 active:scale-95 cursor-pointer"
        :class="[
          canScrollLeft
            ? 'opacity-90 hover:opacity-100'
            : 'opacity-0 pointer-events-none'
        ]"
        aria-label="Produk Sebelumnya"
        @click.stop="scrollPrev"
      >
        <ChevronLeft class="w-4 h-4 text-gray-700 stroke-[2.5]" />
      </button>

      <!-- Right Arrow Button -->
      <button
        type="button"
        class="absolute -right-2 sm:-right-3 top-[42%] -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-gray-800 border border-gray-200 shadow-md flex items-center justify-center transition-all hover:scale-108 active:scale-95 cursor-pointer"
        :class="[
          canScrollRight
            ? 'opacity-90 hover:opacity-100'
            : 'opacity-0 pointer-events-none'
        ]"
        aria-label="Produk Selanjutnya"
        @click.stop="scrollNext"
      >
        <ChevronRight class="w-4 h-4 text-gray-700 stroke-[2.5]" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { Product } from '~/composables/useProducts'

interface Props {
  products?: Product[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  products: () => [],
  loading: false,
})

// Countdown timer: 08:38:11 from mobile v3 / home_red.png
const hours = ref(8)
const minutes = ref(38)
const seconds = ref(11)
let timer: ReturnType<typeof setInterval> | null = null

function formatDigit(num: number) {
  return num.toString().padStart(2, '0')
}

// Fallback products with real production image URLs
const fallbackBestDeals: Product[] = [
  {
    id: 'bd-1',
    _id: 'bd-1',
    title: 'Xiaomi TV Box S (3rd Gen) 4K Ultra HD',
    image: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/products/image-179000280433817423.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=mtXZJZ%2FO29DzLF%2FC5PGzOypAvvmHejVfHSD5W%2Ft9cyx5MgER71024Ue3Vpw2dbFN3lqgbHINXr8pwx5DXJxsEZo1wEawh4SfvL7rpwv6YfasTB%2BKSbGzAK%2BOeTCe%2BlrS8MNZxxQEyXS0r6Hv1A%2BrYbNiCUZBH%2F5K6WxG08V9ImEij%2BE%2BLSd5vqpe6UX9cHvnJMRt2Ag2g9%2FU5gYbdqyFLXAeU1WXTy9VvcFs%2F6RuXwlb4Mlxh4YWwi6rXsU6EnB8%2Bu95V0AlBe1QRbNgm%2BDma2NjWIfi0CgjTPNWBVMOQaN6K5%2F71uFQKnQyfTMA7qrV5nQ4jV%2BLIkw4KwDEzwxmEg%3D%3D',
    discount: 25,
    original_price: 1600000,
    old_price: 1600000,
    price: 1200000,
    city: 'Deli Serdang',
    rate: 5,
    free_delivery: 1,
    is_best_deal: true,
    sell_method: 1,
    allow_meet: true,
    via_courrier: true,
  },
  {
    id: 'bd-2',
    _id: 'bd-2',
    title: 'Xiaomi Redmi 15 (8/128GB - 8/256GB) Garansi Resmi',
    image: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/products/image-178978320576459163.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=b1l9TTSS9%2B6bRQ1E4nGg0HnG%2B4UveSicjZKEKXnD%2FHsbEPcrWktAsjjN3WdCyBk9pZ%2BKGg9LkI02nosZCMnTB4kTIFwz%2B8fHFMJ%2FUjXGZlnBClkR8M%2BPoEohJmmnWrV8zKV157n0RqMSf4ncwZdw656PgZ8p9NEh7NzydHeXBmFgD%2BUbSQepfmbzm8jN%2FBqweLmxvKZFf0u0d1YIPcp2VaaJbmm49LmNQBkScKnMjNQlVdgsKrk7WJ3t2L93qiyybUlbkdGq2%2F%2B6X0vNOkyAxfjKNPRKFBDfjU53Qfn%2FCzA8fthG3pa6gsYiJk9m%2FlyTlJ6gMSLUTM2b9Bx%2BaOP8kw%3D%3D',
    discount: 20,
    original_price: 1500000,
    old_price: 1500000,
    price: 1200000,
    city: 'Jakarta Selatan',
    rate: 4.9,
    free_delivery: 1,
    is_best_deal: true,
    sell_method: 1,
    allow_meet: true,
    via_courrier: true,
  },
  {
    id: 'bd-3',
    _id: 'bd-3',
    title: 'Xiaomi TV Box S 4K HDR Dolby Audio Android TV',
    image: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/products/image-179000280433817423.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=mtXZJZ%2FO29DzLF%2FC5PGzOypAvvmHejVfHSD5W%2Ft9cyx5MgER71024Ue3Vpw2dbFN3lqgbHINXr8pwx5DXJxsEZo1wEawh4SfvL7rpwv6YfasTB%2BKSbGzAK%2BOeTCe%2BlrS8MNZxxQEyXS0r6Hv1A%2BrYbNiCUZBH%2F5K6WxG08V9ImEij%2BE%2BLSd5vqpe6UX9cHvnJMRt2Ag2g9%2FU5gYbdqyFLXAeU1WXTy9VvcFs%2F6RuXwlb4Mlxh4YWwi6rXsU6EnB8%2Bu95V0AlBe1QRbNgm%2BDma2NjWIfi0CgjTPNWBVMOQaN6K5%2F71uFQKnQyfTMA7qrV5nQ4jV%2BLIkw4KwDEzwxmEg%3D%3D',
    discount: 30,
    original_price: 1200000,
    old_price: 1200000,
    price: 840000,
    city: 'Medan',
    rate: 5,
    free_delivery: 0,
    is_best_deal: true,
    sell_method: 1,
    allow_meet: true,
    via_courrier: true,
  },
  {
    id: 'bd-4',
    _id: 'bd-4',
    title: 'Xiaomi Redmi 15 Midnight Black 8/256GB Like New',
    image: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/products/image-178978320576459163.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=b1l9TTSS9%2B6bRQ1E4nGg0HnG%2B4UveSicjZKEKXnD%2FHsbEPcrWktAsjjN3WdCyBk9pZ%2BKGg9LkI02nosZCMnTB4kTIFwz%2B8fHFMJ%2FUjXGZlnBClkR8M%2BPoEohJmmnWrV8zKV157n0RqMSf4ncwZdw656PgZ8p9NEh7NzydHeXBmFgD%2BUbSQepfmbzm8jN%2FBqweLmxvKZFf0u0d1YIPcp2VaaJbmm49LmNQBkScKnMjNQlVdgsKrk7WJ3t2L93qiyybUlbkdGq2%2F%2B6X0vNOkyAxfjKNPRKFBDfjU53Qfn%2FCzA8fthG3pa6gsYiJk9m%2FlyTlJ6gMSLUTM2b9Bx%2BaOP8kw%3D%3D',
    discount: 25,
    original_price: 1199000,
    old_price: 1199000,
    price: 899000,
    city: 'Bogor',
    rate: 4.8,
    free_delivery: 1,
    is_best_deal: true,
    sell_method: 1,
    allow_meet: true,
    via_courrier: true,
  },
  {
    id: 'bd-6',
    _id: 'bd-6',
    title: 'Buku Anak Islami Hardcover: Ayah Bunda Bimbing Aku',
    image: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/products/image-178970354143264521.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=m952Yv79k8vO6LfyRmjxcV2NOExlwWEJw4hX1oaiaYvm8y2RPm%2BUzyOvG4CRG09ts7DS6qFbCTVA6pvzzrg%2FYh6yP3s1SYZZosKjnT0DHfuqUgpMaqOLhMyrvzBAM0TwB4kHGrtPcckrFHtk71MO9I3Tc2gLN1tq2vqfGvYAqzSqnM25yFKRSM4yIR95wWfDjoT%2Bwk2bB3Cuifz%2Biiqb1a4gEWMDVbvfSYDZAku3Q3FyBCGZ81mZQRQal7Fw%2ByshzTCzoYtD7MbobKKXjMePBlenTwVJI6h1vgdpeUSeeyF18Q54gYOGIV%2Bwg%2Fagqji%2FKMaxPcR6Ht3LxqziA1cO1Q%3D%3D',
    discount: 20,
    original_price: 106250,
    old_price: 106250,
    price: 85000,
    city: 'Medan',
    rate: 5,
    free_delivery: 1,
    is_best_deal: true,
    sell_method: 1,
    allow_meet: true,
    via_courrier: true,
  },
]

const displayProducts = computed<Product[]>(() => {
  if (props.products && props.products.length > 0) {
    return props.products
  }
  return fallbackBestDeals
})

// Scroll Navigation
const bdScrollRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)
const showArrows = ref(false)

function updateScrollStatus() {
  const el = bdScrollRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 6
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 6
}

function scrollNext() {
  const el = bdScrollRef.value
  if (!el) return
  const step = el.clientWidth * 0.75
  el.scrollBy({ left: step, behavior: 'smooth' })
}

function scrollPrev() {
  const el = bdScrollRef.value
  if (!el) return
  const step = el.clientWidth * 0.75
  el.scrollBy({ left: -step, behavior: 'smooth' })
}

function handleClick(item: any) {
  const id = item._id || item.id
  if (id) {
    navigateTo(`/product/${id}`)
  }
}

onMounted(() => {
  timer = setInterval(() => {
    if (seconds.value > 0) {
      seconds.value--
    } else if (minutes.value > 0) {
      minutes.value--
      seconds.value = 59
    } else if (hours.value > 0) {
      hours.value--
      minutes.value = 59
      seconds.value = 59
    }
  }, 1000)

  nextTick(() => {
    updateScrollStatus()
  })
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
