<template>
  <div
    class="bg-white rounded-2xl border border-border shadow-2xs transition-all overflow-hidden font-outfit"
    :class="[
      selectable ? 'cursor-pointer hover:border-primary/60' : '',
      selected ? 'border-primary ring-2 ring-primary/10' : '',
    ]"
    @click="selectable ? $emit('select', bank) : null"
  >
    <!-- Card Header: Logo, Name, Badge & Delete Action -->
    <div class="p-4 sm:p-5 flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <!-- Bank Logo -->
        <div class="w-11 h-11 rounded-xl bg-surface-2 border border-border flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
          <img
            v-if="bank.logo && !hasLogoError"
            :src="bank.logo"
            :alt="bank.bank_name"
            class="w-full h-full object-contain"
            loading="lazy"
            @error="hasLogoError = true"
          >
          <Landmark
            v-else
            class="w-5 h-5 text-text-muted"
            aria-hidden="true"
          />
        </div>

        <!-- Bank Name & Subtitle -->
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-sm sm:text-base text-text truncate">
              {{ bank.bank_name || 'Bank' }}
            </h4>
            <span
              v-if="isPrimary"
              class="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10.5px] font-bold shrink-0"
            >
              Utama
            </span>
          </div>
          <p class="text-xs text-text-muted mt-0.5">
            Rekening Penarikan Dana
          </p>
        </div>
      </div>

      <!-- Actions: Select Checkbox (if selectable) OR Delete Button -->
      <div class="flex items-center gap-2 shrink-0">
        <div
          v-if="selectable"
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
          :class="selected ? 'border-primary bg-white' : 'border-border-light bg-white'"
        >
          <div
            v-if="selected"
            class="w-2.5 h-2.5 rounded-full bg-primary"
          />
        </div>

        <button
          v-if="!disabledActions"
          type="button"
          class="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer active:scale-95"
          aria-label="Hapus rekening bank"
          @click.stop="$emit('delete', bank)"
        >
          <Trash2 class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Divider -->
    <div class="h-px bg-border/60 mx-4 sm:mx-5" />

    <!-- Card Body: Account Number & Owner Name -->
    <div class="p-4 sm:p-5 flex items-center justify-between gap-4">
      <!-- Account Number with Eye Toggle for Privacy -->
      <div class="min-w-0">
        <p class="text-[11px] font-medium text-text-muted">
          Nomor Rekening
        </p>
        <div class="flex items-center gap-2 mt-0.5">
          <span class="font-bold text-sm sm:text-base text-text tracking-wider">
            {{ isNumberVisible ? bank.bank_account : maskedNumber }}
          </span>
          <button
            type="button"
            class="p-1 text-text-muted hover:text-text cursor-pointer transition-colors"
            :aria-label="isNumberVisible ? 'Sembunyikan nomor rekening' : 'Tampilkan nomor rekening'"
            @click.stop="isNumberVisible = !isNumberVisible"
          >
            <EyeOff v-if="isNumberVisible" class="w-3.5 h-3.5" aria-hidden="true" />
            <Eye v-else class="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Account Holder Name -->
      <div class="text-right min-w-0">
        <p class="text-[11px] font-medium text-text-muted">
          Nama Pemilik
        </p>
        <div class="flex items-center justify-end gap-1.5 mt-0.5 min-w-0">
          <User class="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
          <span class="font-semibold text-xs sm:text-sm text-text truncate max-w-[160px] sm:max-w-[220px]">
            {{ bank.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Landmark, Trash2, User, Eye, EyeOff } from 'lucide-vue-next'
import type { UserBankAccount } from '~/types/bank'

const props = withDefaults(
  defineProps<{
    bank: UserBankAccount
    isPrimary?: boolean
    selectable?: boolean
    selected?: boolean
    disabledActions?: boolean
  }>(),
  {
    isPrimary: false,
    selectable: false,
    selected: false,
    disabledActions: false,
  }
)

defineEmits<{
  (e: 'select', bank: UserBankAccount): void
  (e: 'delete', bank: UserBankAccount): void
}>()

const isNumberVisible = ref(false)
const hasLogoError = ref(false)

watch(
  () => props.bank.logo,
  () => {
    hasLogoError.value = false
  }
)

const maskedNumber = computed(() => {
  const num = String(props.bank.bank_account || '').trim()
  if (num.length <= 4) return num
  const start = num.slice(0, 3)
  const end = num.slice(-3)
  return `${start} •••• ${end}`
})
</script>
