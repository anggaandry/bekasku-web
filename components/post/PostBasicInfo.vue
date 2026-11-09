<template>
  <div class="bg-white rounded-2xl border border-border-light p-4 sm:p-6 shadow-xs space-y-5">
    <div class="flex items-center justify-between pb-3 border-b border-border-light">
      <h3 class="text-base font-bold text-text-primary">{{ sectionTitle }}</h3>
      <span class="text-xs text-text-muted">* Wajib diisi</span>
    </div>

    <!-- Category Selector Box -->
    <div>
      <label class="block text-xs font-semibold text-text-primary mb-1.5">
        {{ categoryLabel }} <span class="text-danger">*</span>
      </label>

      <div
        class="border rounded-xl p-3.5 flex items-center justify-between transition-all cursor-pointer group"
        :class="
          errors.category || errors.subcategory || errors.category_id || errors.subcategory_id
            ? 'border-danger bg-danger/5'
            : 'border-border-light hover:border-primary/50 hover:bg-surface-2'
        "
        @click="$emit('open-category-modal')"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
            :class="selectedSubcategory ? 'bg-primary/10 text-primary' : 'bg-surface-3 text-text-muted'"
          >
            <Grid class="w-5 h-5" />
          </div>

          <div class="min-w-0">
            <template v-if="selectedCategory && selectedSubcategory">
              <p class="text-xs text-text-muted truncate">
                {{ selectedCategory.name_id }}
              </p>
              <p class="text-sm font-bold text-text-primary truncate">
                {{ selectedSubcategory.name_id }}
                <span v-if="selectedTypeCategory" class="text-text-muted font-normal">
                  • {{ selectedTypeCategory.name_id }}
                </span>
              </p>
            </template>
            <template v-else>
              <p class="text-sm font-medium text-text-muted">Pilih {{ categoryLabel }}</p>
              <p class="text-[11px] text-text-muted">Tentukan kategori agar iklan mudah ditemukan</p>
            </template>
          </div>
        </div>

        <div class="flex items-center gap-1.5 text-xs font-bold text-primary shrink-0 pl-2">
          <span>{{ selectedSubcategory ? 'Ubah' : 'Pilih' }}</span>
          <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      <p v-if="errors.category || errors.subcategory || errors.category_id || errors.subcategory_id" class="mt-1 text-xs text-danger font-medium">
        {{ errors.category || errors.subcategory || errors.category_id || errors.subcategory_id }}
      </p>
    </div>

    <!-- Tipe Barang Dropdown (if available in subcategory) -->
    <div v-if="typeCategories && typeCategories.length > 0">
      <label class="block text-xs font-semibold text-text-primary mb-1.5">
        {{ isService ? 'Tipe Jasa' : isNeeded ? 'Tipe Barang Dibutuhkan' : 'Tipe Barang' }} <span class="text-text-muted font-normal">(Opsional)</span>
      </label>
      <div class="relative">
        <select
          :value="selectedTypeCategory?._id || ''"
          class="w-full bg-surface-2 border border-border-light rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer pr-10"
          @change="onTypeCategoryChange"
        >
          <option value="">Pilih {{ isService ? 'Tipe Jasa' : isNeeded ? 'Tipe Kebutuhan' : 'Tipe Barang' }}</option>
          <option
            v-for="item in typeCategories"
            :key="item._id"
            :value="item._id"
          >
            {{ item.name_id }}
          </option>
        </select>
        <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
          <ChevronDown class="w-4 h-4" />
        </div>
      </div>
    </div>

    <!-- Judul Barang / Jasa / Kebutuhan -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label class="block text-xs font-semibold text-text-primary">
          {{ titleLabel }} <span class="text-danger">*</span>
        </label>
        <span
          class="text-[11px] font-medium"
          :class="title.length > 70 ? 'text-danger font-bold' : 'text-text-muted'"
        >
          {{ title.length }}/70
        </span>
      </div>

      <input
        :value="title"
        type="text"
        maxlength="70"
        :placeholder="titlePlaceholder"
        class="w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
        :class="errors.title ? 'border-danger bg-danger/5' : 'border-border-light'"
        @input="$emit('update:title', ($event.target as HTMLInputElement).value)"
      />

      <p v-if="errors.title" class="mt-1 text-xs text-danger font-medium">
        {{ errors.title }}
      </p>
      <p v-else class="mt-1 text-[11px] text-text-muted">
        {{ titleTips }}
      </p>
    </div>

    <!-- Deskripsi Barang / Jasa / Kebutuhan -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label class="block text-xs font-semibold text-text-primary">
          {{ descLabel }} <span class="text-danger">*</span>
        </label>
        <span
          class="text-[11px] font-medium"
          :class="description.length > 1500 ? 'text-danger font-bold' : 'text-text-muted'"
        >
          {{ description.length }}/1500
        </span>
      </div>

      <textarea
        :value="description"
        rows="5"
        maxlength="1500"
        :placeholder="descPlaceholder"
        class="w-full bg-white border rounded-xl p-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all resize-none leading-relaxed"
        :class="errors.description ? 'border-danger bg-danger/5' : 'border-border-light'"
        @input="$emit('update:description', ($event.target as HTMLTextAreaElement).value)"
      />

      <p v-if="errors.description" class="mt-1 text-xs text-danger font-medium">
        {{ errors.description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Grid, ChevronRight, ChevronDown } from 'lucide-vue-next'
import {
  SELL_METHOD_DIRECT,
  SELL_METHOD_NEEDED,
  SELL_METHOD_SERVICE,
} from '~/utils/constants'
import type { CategoryItem, SubcategoryItem, TypeCategoryItem } from '~/types/post'

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    sellMethod?: number
    selectedCategory: CategoryItem | null
    selectedSubcategory: SubcategoryItem | null
    selectedTypeCategory: TypeCategoryItem | null
    typeCategories: TypeCategoryItem[]
    errors: Record<string, string>
  }>(),
  {
    sellMethod: SELL_METHOD_DIRECT,
  }
)

const emit = defineEmits<{
  (e: 'update:title', val: string): void
  (e: 'update:description', val: string): void
  (e: 'update:selectedTypeCategory', val: TypeCategoryItem | null): void
  (e: 'open-category-modal'): void
}>()

const isNeeded = computed(() => props.sellMethod === SELL_METHOD_NEEDED)
const isService = computed(() => props.sellMethod === SELL_METHOD_SERVICE)

const sectionTitle = computed(() => {
  if (isNeeded.value) return 'Informasi Kebutuhan'
  if (isService.value) return 'Informasi Jasa'
  return 'Informasi Barang'
})

const categoryLabel = computed(() => {
  if (isNeeded.value) return 'Kategori Kebutuhan'
  if (isService.value) return 'Kategori Jasa'
  return 'Kategori Barang'
})

const titleLabel = computed(() => {
  if (isNeeded.value) return 'Judul barang yang dibutuhkan'
  if (isService.value) return 'Judul Jasa'
  return 'Judul barang'
})

const titlePlaceholder = computed(() => {
  if (isNeeded.value) return 'Masukkan judul barang yang dibutuhkan'
  if (isService.value) return 'Masukkan judul jasa'
  return 'Masukkan judul barang'
})

const titleTips = computed(() => {
  if (isNeeded.value) return 'Tips: Sebutkan spesifik model atau barang yang ingin Anda beli'
  if (isService.value) return 'Tips: Sebutkan nama keahlian atau jenis layanan jasa yang ditawarkan'
  return 'Tips: Sebutkan jenis produk, merek, dan model (misal: "iPhone 13 128GB Midnight Mulus")'
})

const descLabel = computed(() => {
  if (isNeeded.value) return 'Deskripsi barang yang dibutuhkan'
  if (isService.value) return 'Deskripsi jasa'
  return 'Deskripsi barang'
})

const descPlaceholder = computed(() => {
  if (isNeeded.value) return 'Berikan deskripsi barang yang dibutuhkan secara jelas agar penjual dapat memberikan penawaran terbaik...'
  if (isService.value) return 'Berikan deskripsi jasa, cakupan layanan, pengalaman, portofolio, dan syarat kerja...'
  return 'Berikan deskripsi barang... Jelaskan kondisi, kelengkapan, riwayat pemakaian, alasan jual, dan minus jika ada.'
})

function onTypeCategoryChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  if (!val) {
    emit('update:selectedTypeCategory', null)
    return
  }
  const match = props.typeCategories.find((t) => t._id === val) || null
  emit('update:selectedTypeCategory', match)
}
</script>

