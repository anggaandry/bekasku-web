<template>
  <Teleport to="body" v-if="isMounted">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[85] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-xs font-outfit overscroll-contain"
      role="dialog"
      aria-modal="true"
      @click.self="emit('update:modelValue', false)"
    >
    <div class="w-full md:max-w-sm bg-white rounded-t-[20px] md:rounded-2xl shadow-2xl p-5 pb-7 md:pb-5">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <button
          type="button"
          class="p-1 text-text hover:text-primary rounded-lg cursor-pointer"
          aria-label="Tutup"
          @click="emit('update:modelValue', false)"
        >
          <X class="w-6 h-6" />
        </button>
        <h2 class="font-outfit font-bold text-lg text-text">
          Urutkan
        </h2>
      </div>

      <!-- Radio Options -->
      <div class="divide-y divide-border">
        <button
          v-for="opt in sortOptions"
          :key="opt.value"
          type="button"
          class="w-full py-4 flex items-center justify-between text-left cursor-pointer group"
          @click="selectedSort = opt.value"
        >
          <span
            class="font-outfit text-base text-text"
            :class="selectedSort === opt.value ? 'font-medium' : 'font-normal'"
          >
            {{ opt.label }}
          </span>
          <span
            class="w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors"
            :class="selectedSort === opt.value ? 'border-primary' : 'border-text-subtle'"
          >
            <span
              v-if="selectedSort === opt.value"
              class="w-3 h-3 rounded-full bg-primary"
            />
          </span>
        </button>
      </div>

      <!-- Apply Button -->
      <div class="mt-6">
        <button
          type="button"
          class="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-outfit font-bold text-base shadow-md transition-all active:scale-[0.99] cursor-pointer"
          @click="applySort"
        >
          Terapkan
        </button>
      </div>
    </div>
  </div>
</Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { SearchFilters } from '~/types/search'

const props = defineProps<{
  modelValue: boolean
  filters: SearchFilters
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  apply: [sortPatch: Partial<SearchFilters>]
}>()

const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

watch(
  () => props.modelValue,
  (val) => {
    if (import.meta.client) {
      if (val) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (import.meta.client && props.modelValue) {
    document.body.style.overflow = ''
  }
})

type SortType = 'paling_sesuai' | 'terbaru' | 'tertinggi' | 'terendah'

const sortOptions: { label: string; value: SortType }[] = [
  { label: 'Paling Sesuai', value: 'paling_sesuai' },
  { label: 'Terbaru', value: 'terbaru' },
  { label: 'Harga Tertinggi', value: 'tertinggi' },
  { label: 'Harga Rendah', value: 'terendah' },
]

const selectedSort = ref<SortType>('paling_sesuai')

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.filters.newest === 1) selectedSort.value = 'terbaru'
      else if (props.filters.mostExpensive === 1) selectedSort.value = 'tertinggi'
      else if (props.filters.cheapest === 1) selectedSort.value = 'terendah'
      else selectedSort.value = 'paling_sesuai'
    }
  },
  { immediate: true }
)

function applySort() {
  emit('apply', {
    newest: selectedSort.value === 'terbaru' ? 1 : 0,
    mostExpensive: selectedSort.value === 'tertinggi' ? 1 : 0,
    cheapest: selectedSort.value === 'terendah' ? 1 : 0,
  })
  emit('update:modelValue', false)
}
</script>
