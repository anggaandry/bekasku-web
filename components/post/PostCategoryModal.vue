<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import {
  Search,
  ChevronRight,
  ArrowLeft,
  X,
  Smartphone,
  Car,
  Bike,
  Home,
  Dumbbell,
  Calendar,
  Shirt,
  Baby,
  BookOpen,
  Armchair,
  ShoppingBag,
  Sparkles,
  Gem,
  Package,
} from 'lucide-vue-next'
import type { CategoryItem, SubcategoryItem, TypeCategoryItem } from '~/types/post'

interface Props {
  modelValue: boolean
  categories: CategoryItem[]
  subcategories?: SubcategoryItem[]
  typeCategories?: TypeCategoryItem[]
  isSubcategoriesLoading?: boolean
  selectedCategory?: CategoryItem | null
  selectedSubcategory?: SubcategoryItem | null
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  subcategories: () => [],
  typeCategories: () => [],
  isSubcategoriesLoading: false,
  selectedCategory: null,
  selectedSubcategory: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'select-category', cat: CategoryItem): void
  (e: 'select-subcategory', sub: SubcategoryItem): void
  (e: 'select-type', typeCat: TypeCategoryItem): void
}>()

const step = ref<'category' | 'subcategory' | 'type'>('category')
const searchQuery = ref('')
const activeCat = ref<CategoryItem | null>(null)
const activeSub = ref<SubcategoryItem | null>(null)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      searchQuery.value = ''
      if (props.selectedCategory && props.selectedSubcategory) {
        activeCat.value = props.selectedCategory
        activeSub.value = props.selectedSubcategory
        step.value = 'subcategory'
      } else {
        step.value = 'category'
      }
      if (import.meta.client) document.body.style.overflow = 'hidden'
    } else {
      if (import.meta.client) document.body.style.overflow = ''
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (import.meta.client && props.modelValue) {
    document.body.style.overflow = ''
  }
})

function close() {
  emit('update:modelValue', false)
}

function handleCategoryClick(cat: CategoryItem) {
  activeCat.value = cat
  emit('select-category', cat)
  step.value = 'subcategory'
}

function handleSubcategoryClick(sub: SubcategoryItem) {
  activeSub.value = sub
  emit('select-subcategory', sub)
  close()
}

function goBackToCategory() {
  step.value = 'category'
}

const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) return props.categories
  const q = searchQuery.value.toLowerCase().trim()
  return props.categories.filter((c) => {
    const name = (c.name_id || c.name || c.name_en || '').toLowerCase()
    return name.includes(q)
  })
})

const filteredSubcategories = computed(() => {
  if (!searchQuery.value.trim()) return props.subcategories
  const q = searchQuery.value.toLowerCase().trim()
  return props.subcategories.filter((s) => {
    const name = (s.name_id || s.name || s.name_en || '').toLowerCase()
    return name.includes(q)
  })
})

const fallbackCategoryImages: Record<string, string> = {
  fesyen_wanita: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565020607-07_Fesyen_Wanita.png?alt=media&token=a317bfc9-ae17-4bbf-b683-59fe6c556c65',
  fesyen_pria: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565035092-08_Fesyen_Pria.png?alt=media&token=eea14aae-8799-4c76-87b2-98c82aeec5b6',
  elektronik: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565311039-04_Barang_Elektronik.png?alt=media&token=257065fd-465b-4239-8b3d-1e4bc4407a45',
  ponsel_tablet: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565241953-02_Ponsel_dan_Tablet.png?alt=media&token=b97225cc-8eaf-40e0-91dd-e9575d0f3c98',
  video_game: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565375013-15_Video_Game.png?alt=media&token=88f55b45-7cc1-4793-a66c-74facab26086',
  mewah: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781568108145-Gemini_Generated_Image_sml1c4sml1c4sml1__1_-removebg-preview.png?alt=media&token=07070c24-79da-4331-808d-2142d25524eb',
  anak_bayi: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565215646-11_Anak_dan_Bayi_a.png?alt=media&token=d55e5693-8424-4995-9bf6-3b449f2cbe37',
  mainan: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565259181-12_Anak_dan_Bayi_b.png?alt=media&token=567f9b8c-3d2c-418a-ac2e-9e4cc94bd390',
  perhiasan: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565280694-03_Perhiasan.png?alt=media&token=8e5caa31-7b92-44fc-b9a8-6eaf90763420',
  mobil: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565345271-13_Mobil.png?alt=media&token=be021b2a-9fa0-46a2-8a60-7fdbd1f89daf',
  motor: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1755747583705-s-blob-v1-IMAGE-zdfSBqMqKmw.png?alt=media&token=2cd3f36b-55bc-426b-80c5-39cb9e9b0c85',
  properti: 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/category%2F1781565333688-06_Properti.png?alt=media&token=92547e6e-0fb8-43ea-bed0-871fb173719c',
}

function getCategoryImage(cat: CategoryItem): string | null {
  if (cat.image && (cat.image.startsWith('http') || cat.image.startsWith('/'))) {
    return cat.image
  }
  const n = (cat.name_id || cat.name_en || cat.name || '').toLowerCase()
  if (n.includes('ponsel') || n.includes('tablet')) return fallbackCategoryImages.ponsel_tablet
  if (n.includes('mobil')) return fallbackCategoryImages.mobil
  if (n.includes('motor')) return fallbackCategoryImages.motor
  if (n.includes('properti') || n.includes('rumah')) return fallbackCategoryImages.properti
  if (n.includes('pria')) return fallbackCategoryImages.fesyen_pria
  if (n.includes('wanita')) return fallbackCategoryImages.fesyen_wanita
  if (n.includes('anak') || n.includes('bayi')) return fallbackCategoryImages.anak_bayi
  if (n.includes('mainan')) return fallbackCategoryImages.mainan
  if (n.includes('game')) return fallbackCategoryImages.video_game
  if (n.includes('mewah')) return fallbackCategoryImages.mewah
  if (n.includes('perhiasan')) return fallbackCategoryImages.perhiasan
  if (n.includes('elektronik')) return fallbackCategoryImages.elektronik
  return null
}

function getCategoryIcon(name: string) {
  const n = (name || '').toLowerCase()
  if (n.includes('ponsel') || n.includes('gadget') || n.includes('tablet')) return Smartphone
  if (n.includes('mobil')) return Car
  if (n.includes('motor')) return Bike
  if (n.includes('properti') || n.includes('rumah')) return Home
  if (n.includes('olahraga')) return Dumbbell
  if (n.includes('sehari') || n.includes('harian')) return Calendar
  if (n.includes('pria') || n.includes('wanita') || n.includes('fesyen')) return Shirt
  if (n.includes('bayi') || n.includes('anak')) return Baby
  if (n.includes('buku') || n.includes('kantor')) return BookOpen
  if (n.includes('antik') || n.includes('mebel') || n.includes('furnitur')) return Armchair
  if (n.includes('mewah') || n.includes('perhiasan')) return Gem
  return Package
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain transition-opacity font-outfit"
      role="dialog"
      aria-modal="true"
      @click.self="close"
    >
      <div
        class="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col h-[85vh] max-h-[640px] animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
      >
        <!-- Modal Header -->
        <div class="px-5 pt-4 pb-3 border-b border-border-light flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <button
              v-if="step !== 'category'"
              type="button"
              class="p-1 -ml-1 text-text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Kembali ke kategori"
              @click="goBackToCategory"
            >
              <ArrowLeft class="w-5 h-5" aria-hidden="true" />
            </button>
            <div>
              <h2 class="text-base font-bold text-text">
                {{ step === 'category' ? (title || 'Pilih Kategori Barang') : activeCat?.name_id || 'Pilih Subkategori' }}
              </h2>
              <p class="text-[11px] text-text-muted">
                {{ step === 'category' ? 'Tentukan kategori yang paling sesuai' : 'Pilih subkategori spesifik' }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="p-1.5 -mr-1 text-text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Tutup"
            @click="close"
          >
            <X class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <!-- Search Input -->
        <div class="p-3.5 border-b border-border-light shrink-0">
          <div class="relative">
            <Search class="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="step === 'category' ? 'Cari kategori (meja, pakaian, gadget...)' : 'Cari subkategori...'"
              class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border-light text-xs text-text placeholder:text-text-subtle focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <!-- List Section -->
        <div class="flex-1 overflow-y-auto divide-y divide-border-light p-2">
          <!-- Step 1: Categories -->
          <template v-if="step === 'category'">
            <button
              v-for="cat in filteredCategories"
              :key="cat._id"
              type="button"
              class="w-full px-3.5 py-3 rounded-xl hover:bg-surface-2 flex items-center justify-between text-left transition-colors cursor-pointer group"
              @click="handleCategoryClick(cat)"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 flex items-center justify-center shrink-0">
                  <img
                    v-if="getCategoryImage(cat)"
                    :src="getCategoryImage(cat)!"
                    :alt="cat.name_id || cat.name || ''"
                    class="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                    loading="lazy"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-xl bg-surface-2 text-primary flex items-center justify-center border border-border-light group-hover:bg-primary/10 transition-colors"
                  >
                    <component :is="getCategoryIcon(cat.name_id || cat.name || '')" class="w-4 h-4" aria-hidden="true" />
                  </div>
                </div>
                <span class="text-xs sm:text-sm font-semibold text-text group-hover:text-primary transition-colors">
                  {{ cat.name_id || cat.name }}
                </span>
              </div>
              <ChevronRight class="w-4 h-4 text-text-subtle group-hover:text-primary group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
            </button>

            <div v-if="filteredCategories.length === 0" class="py-12 text-center text-xs text-text-muted">
              Kategori tidak ditemukan
            </div>
          </template>

          <!-- Step 2: Subcategories -->
          <template v-else-if="step === 'subcategory'">
            <div v-if="isSubcategoriesLoading" class="py-12 text-center text-xs text-text-muted">
              Memuat subkategori...
            </div>
            <template v-else>
              <button
                v-for="sub in filteredSubcategories"
                :key="sub._id"
                type="button"
                class="w-full px-3.5 py-3 rounded-xl hover:bg-surface-2 flex items-center justify-between text-left transition-colors cursor-pointer group"
                @click="handleSubcategoryClick(sub)"
              >
                <div>
                  <p class="text-xs sm:text-sm font-semibold text-text group-hover:text-primary transition-colors">
                    {{ sub.name_id || sub.name }}
                  </p>
                  <p v-if="sub.charge" class="text-[10px] text-text-muted mt-0.5">
                    Biaya layanan: {{ sub.charge }}%
                  </p>
                </div>
                <ChevronRight class="w-4 h-4 text-text-subtle group-hover:text-primary group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
              </button>

              <div v-if="filteredSubcategories.length === 0" class="py-12 text-center text-xs text-text-muted">
                Subkategori tidak ditemukan
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>
