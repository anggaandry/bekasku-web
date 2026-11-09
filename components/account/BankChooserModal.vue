<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs font-outfit overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bank-choose-title"
        @click.self="handleClose"
      >
        <div
          class="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <!-- Drag Handle for Mobile -->
          <div class="w-12 h-1.5 bg-border rounded-full mx-auto sm:hidden mt-3 mb-1" />

          <!-- Header -->
          <div class="px-5 sm:px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-white">
            <h3 id="bank-choose-title" class="font-bold text-base sm:text-lg text-text">
              Pilih Bank
            </h3>
            <button
              type="button"
              class="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Tutup pilihan bank"
              @click="handleClose"
            >
              <X class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <!-- Search Input -->
          <div class="px-5 sm:px-6 py-3 border-b border-border bg-surface-2/40 shrink-0">
            <div class="relative">
              <Search class="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                v-model="searchInput"
                type="text"
                placeholder="Cari nama bank..."
                class="w-full h-11 pl-10 pr-9 rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm text-text placeholder:text-text-muted transition-colors"
                @input="handleInput"
              >
              <button
                v-if="searchInput"
                type="button"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer p-1"
                aria-label="Hapus pencarian bank"
                @click="clearSearch"
              >
                <X class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Bank List Container -->
          <div
            class="flex-1 overflow-y-auto overscroll-contain divide-y divide-border/60 p-2 sm:p-3"
            @scroll="handleScroll"
          >
            <!-- Loading initial -->
            <div
              v-if="loading && banks.length === 0"
              class="p-8 flex flex-col items-center justify-center space-y-2 text-text-muted text-xs"
            >
              <Loader2 class="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
              <p>Memuat daftar bank...</p>
            </div>

            <!-- Empty Search Results -->
            <div
              v-else-if="!loading && banks.length === 0"
              class="p-8 text-center space-y-3"
            >
              <div class="w-12 h-12 mx-auto rounded-full bg-surface-2 flex items-center justify-center text-text-muted">
                <Landmark class="w-6 h-6" aria-hidden="true" />
              </div>
              <p class="text-xs text-text-muted">
                Bank tidak ditemukan untuk kata kunci "{{ searchInput }}"
              </p>
              <p class="text-[11px] text-text-subtle">
                Kamu dapat memilih "Bank Lainnya" di bawah ini.
              </p>
            </div>

            <!-- Bank Items -->
            <template v-else>
              <button
                v-for="bank in banks"
                :key="bank._id || bank.id"
                type="button"
                class="w-full px-4 py-3 flex items-center justify-between gap-3 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer text-left group"
                @click="selectAndClose(bank)"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center p-1 shrink-0 overflow-hidden relative">
                    <img
                      v-if="bank.image && !brokenImages[bank._id || bank.id || '']"
                      :src="bank.image"
                      :alt="bank.name"
                      class="w-full h-full object-contain"
                      loading="lazy"
                      @error="handleImageError(bank._id || bank.id || '')"
                    >
                    <Landmark
                      v-else
                      class="w-4 h-4 text-text-muted"
                      aria-hidden="true"
                    />
                  </div>
                  <span class="font-semibold text-xs sm:text-sm text-text truncate group-hover:text-primary transition-colors">
                    {{ bank.name }}
                  </span>
                </div>

                <div
                  v-if="selectedBankId === (bank._id || bank.id)"
                  class="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0"
                >
                  <Check class="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                </div>
              </button>
            </template>

            <!-- Always visible option: Bank Lainnya -->
            <div class="pt-2">
              <button
                type="button"
                class="w-full px-4 py-3.5 flex items-center justify-between gap-3 rounded-xl bg-surface-2/60 hover:bg-surface-2 border border-dashed border-border transition-colors cursor-pointer text-left group"
                @click="selectAndClose(otherBankItem)"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                    <Landmark class="w-4 h-4 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <span class="font-bold text-xs sm:text-sm text-text block group-hover:text-primary transition-colors">
                      Bank Lainnya
                    </span>
                    <span class="text-[11px] text-text-muted block">
                      Pilih jika bank kamu tidak ada dalam daftar di atas
                    </span>
                  </div>
                </div>

                <div
                  v-if="selectedBankId === otherBankItem._id"
                  class="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0"
                >
                  <Check class="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                </div>
              </button>
            </div>

            <!-- Loading more spinner -->
            <div v-if="loading && banks.length > 0" class="py-3 text-center">
              <Loader2 class="w-4 h-4 animate-spin text-primary inline-block" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { X, Search, Landmark, Loader2, Check } from 'lucide-vue-next'
import { useBankList } from '~/composables/useBankList'
import type { BankItem } from '~/types/bank'

const props = defineProps<{
  modelValue: boolean
  selectedBankId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', bank: BankItem): void
}>()

const {
  banks,
  loading,
  otherBankItem,
  fetchBanks,
  onSearch,
  loadMore,
} = useBankList()

const searchInput = ref('')
const brokenImages = ref<Record<string, boolean>>({})

function handleImageError(id: string) {
  if (id) {
    brokenImages.value[id] = true
  }
}

function handleInput() {
  onSearch(searchInput.value)
}

function clearSearch() {
  searchInput.value = ''
  onSearch('')
}

function selectAndClose(bank: BankItem) {
  emit('select', bank)
  handleClose()
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 60) {
    loadMore()
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (import.meta.client) {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
    if (isOpen && banks.value.length === 0) {
      fetchBanks('', 1)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
