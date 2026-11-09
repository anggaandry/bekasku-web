<template>
  <div v-if="items.length > 0" class="py-2">
    <!-- Header Row: Pencarian terakhir + Hapus semua -->
    <div class="px-4 py-2 flex items-center justify-between">
      <h2 class="font-outfit font-bold text-base text-text">
        Pencarian terakhir
      </h2>
      <button
        type="button"
        class="font-outfit text-sm text-primary hover:text-primary-dark font-normal cursor-pointer transition-colors"
        @click="showClearAllConfirm = true"
      >
        Hapus semua
      </button>
    </div>

    <!-- History List Items -->
    <ul class="divide-y divide-transparent">
      <li
        v-for="item in displayedItems"
        :key="item.id || item._id || item.keyword"
        class="flex items-center justify-between px-4 py-2.5 hover:bg-surface-2 transition-colors group"
      >
        <button
          type="button"
          class="flex items-center gap-3.5 flex-1 min-w-0 text-left cursor-pointer"
          @click="emit('select', item.keyword)"
        >
          <History class="w-[18px] h-[18px] text-text-muted shrink-0" />
          <span class="font-outfit text-sm text-text truncate group-hover:text-primary transition-colors">
            {{ item.keyword }}
          </span>
        </button>

        <button
          type="button"
          class="p-1 text-text-subtle hover:text-text-muted shrink-0 cursor-pointer ml-2"
          :aria-label="`Hapus riwayat ${item.keyword}`"
          @click.stop="promptDeleteOne(item.keyword)"
        >
          <X class="w-4 h-4" />
        </button>
      </li>
    </ul>

    <!-- Toggle: Lihat semua / Sembunyikan -->
    <div v-if="items.length > initialLimit" class="flex justify-center pt-2 pb-1">
      <button
        type="button"
        class="font-outfit text-sm font-medium text-primary hover:text-primary-dark py-1.5 px-4 cursor-pointer transition-colors"
        @click="showAll = !showAll"
      >
        {{ showAll ? 'Sembunyikan' : 'Lihat semua' }}
      </button>
    </div>

    <!-- Confirmation Modal for Single Item Delete -->
    <AppModal
      v-model="showSingleConfirm"
      title="Hapus Riwayat Pencarian"
    >
      <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
        Apakah Anda yakin ingin menghapus kata kunci
        <span class="font-semibold text-text">"{{ pendingKeyword }}"</span> dari riwayat pencarian?
      </p>
      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-2 cursor-pointer"
            @click="showSingleConfirm = false"
          >
            Batal
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer"
            @click="confirmDeleteOne"
          >
            Hapus
          </button>
        </div>
      </template>
    </AppModal>

    <!-- Confirmation Modal for Clear All -->
    <AppModal
      v-model="showClearAllConfirm"
      title="Hapus Semua Riwayat"
    >
      <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
        Apakah Anda yakin ingin menghapus seluruh riwayat pencarian Anda?
      </p>
      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-2 cursor-pointer"
            @click="showClearAllConfirm = false"
          >
            Batal
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer"
            @click="confirmClearAll"
          >
            Hapus Semua
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { History, X } from 'lucide-vue-next'
import type { SearchHistoryItem } from '~/types/search'
import AppModal from '~/components/shared/AppModal.vue'

const props = withDefaults(
  defineProps<{
    items: SearchHistoryItem[]
    initialLimit?: number
  }>(),
  {
    initialLimit: 3,
  }
)

const emit = defineEmits<{
  select: [keyword: string]
  delete: [keyword: string]
  clearAll: []
}>()

const showAll = ref(false)
const showSingleConfirm = ref(false)
const showClearAllConfirm = ref(false)
const pendingKeyword = ref('')

const displayedItems = computed(() => {
  if (showAll.value) return props.items.slice(0, 50)
  return props.items.slice(0, props.initialLimit)
})

function promptDeleteOne(keyword: string) {
  pendingKeyword.value = keyword
  showSingleConfirm.value = true
}

function confirmDeleteOne() {
  if (pendingKeyword.value) {
    emit('delete', pendingKeyword.value)
  }
  showSingleConfirm.value = false
  pendingKeyword.value = ''
}

function confirmClearAll() {
  emit('clearAll')
  showClearAllConfirm.value = false
}
</script>

