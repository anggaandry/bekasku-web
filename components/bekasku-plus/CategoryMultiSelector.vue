<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Check, X, ChevronDown } from 'lucide-vue-next'
import { DEFAULT_BEKASKU_CATEGORIES } from '~/types/bekasku-plus'

interface CategoryItem {
  id: string
  name: string
}

interface Props {
  modelValue: CategoryItem[]
  categories?: CategoryItem[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  categories: () => [],
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: CategoryItem[]): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')

const effectiveCategories = computed(() => {
  return props.categories && props.categories.length > 0
    ? props.categories
    : DEFAULT_BEKASKU_CATEGORIES
})

const filteredList = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return effectiveCategories.value
  return effectiveCategories.value.filter((cat) => cat.name.toLowerCase().includes(query))
})

const isSelected = (cat: CategoryItem) => {
  return props.modelValue.some((item) => item.name === cat.name)
}

const toggleCategory = (cat: CategoryItem) => {
  const exists = isSelected(cat)
  let updated: CategoryItem[]
  if (exists) {
    updated = props.modelValue.filter((item) => item.name !== cat.name)
  } else {
    updated = [...props.modelValue, cat]
  }
  emit('update:modelValue', updated)
}

const displayText = computed(() => {
  if (props.modelValue.length === 0) return 'Pilih Kategori'
  return props.modelValue.map((c) => c.name).join(', ')
})
</script>

<template>
  <div class="relative w-full">
    <!-- Trigger Box (matches Image 3) -->
    <button
      type="button"
      class="w-full text-left px-4 py-3.5 bg-white border border-border rounded-xl flex items-center justify-between text-sm hover:border-text-muted transition-colors cursor-pointer"
      @click="isOpen = true"
    >
      <span :class="props.modelValue.length > 0 ? 'text-text font-medium' : 'text-text-muted'">
        {{ displayText }}
      </span>
      <ChevronDown class="w-5 h-5 text-text-muted shrink-0" />
    </button>

    <!-- Modal / Bottom Sheet (matches Image 2) -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        @click.self="isOpen = false"
      >
        <div class="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[80vh]">
          <!-- Top drag pill (mobile) -->
          <div class="sm:hidden pt-3 pb-1 flex justify-center">
            <div class="w-10 h-1 bg-border rounded-full" />
          </div>

          <!-- Header -->
          <div class="px-5 py-3.5 border-b border-border-light flex items-center gap-3">
            <button
              type="button"
              class="p-1 -ml-1 text-text hover:text-primary transition-colors cursor-pointer"
              aria-label="Tutup"
              @click="isOpen = false"
            >
              <X class="w-5 h-5" />
            </button>
            <h3 class="text-base font-bold text-text font-outfit">
              Pilih Kategori Barang
            </h3>
          </div>

          <!-- Search Bar & Subtitle -->
          <div class="p-4 space-y-2 border-b border-border-light">
            <div class="relative">
              <Search class="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="categorySearch"
                v-model="searchQuery"
                name="categorySearch"
                type="text"
                placeholder="Cari Kategori"
                aria-label="Cari Kategori"
                class="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-colors"
              />
            </div>
            <p class="text-xs text-text-muted font-outfit">
              Bisa pilih lebih dari 1 kategori barang
            </p>
          </div>

          <!-- Categories List with Checkbox on Right -->
          <div class="p-3 overflow-y-auto space-y-1 flex-1 divide-y divide-border-light">
            <div
              v-for="cat in filteredList"
              :key="cat.id"
              class="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-surface-2 cursor-pointer transition-colors"
              @click="toggleCategory(cat)"
            >
              <span class="text-sm font-medium text-text font-outfit">
                {{ cat.name }}
              </span>
              <div
                class="w-5 h-5 rounded-md border flex items-center justify-center transition-colors"
                :class="isSelected(cat) ? 'bg-primary border-primary text-white' : 'border-border bg-white'"
              >
                <Check v-if="isSelected(cat)" class="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <div v-if="filteredList.length === 0" class="py-8 text-center text-xs text-text-muted">
              Kategori tidak ditemukan
            </div>
          </div>

          <!-- Footer Action Button -->
          <div class="p-4 border-t border-border-light bg-white">
            <button
              type="button"
              class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-semibold text-sm transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-98"
              @click="isOpen = false"
            >
              Pilih Kategori
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
