<template>
  <div class="bg-white rounded-2xl border border-border-light p-4 sm:p-6 shadow-xs space-y-5" id="post-section-specs">
    <div class="flex items-center justify-between pb-3 border-b border-border-light">
      <div class="flex items-center gap-2">
        <h3 class="text-base font-bold text-text-primary">Spesifikasi Produk</h3>
        <span v-if="dynamicForms && dynamicForms.length > 0" class="text-danger text-sm font-bold">*</span>
        <span
          v-if="errors.specs"
          class="text-[11px] font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-full flex items-center gap-1"
        >
          <AlertCircle class="w-3 h-3" />
          <span>{{ errors.specs }}</span>
        </span>
      </div>
      <span class="text-xs text-text-muted">Bantu pembeli memahami kondisi barang</span>
    </div>

    <!-- Dynamic Category Form Fields -->
    <div v-if="dynamicForms && dynamicForms.length > 0" class="space-y-4">
      <div v-for="field in dynamicForms" :key="field.id">
        <!-- Field Label -->
        <label class="block text-xs font-semibold text-text-primary mb-1.5">
          {{ field.name_id || field.name }}
          <span v-if="isFieldRequired(field)" class="text-danger">*</span>
          <span v-else class="text-text-muted font-normal text-[11px] ml-1">(Opsional)</span>
        </label>

        <!-- Type 1: Dropdown Select -->
        <div v-if="String(field.type) === '1' && field.list && field.list.length > 0" class="relative">
          <select
            :value="getAnswerId(field.id)"
            class="w-full bg-surface-2 border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer pr-10"
            :class="errors['dynamic_' + field.id] ? 'border-danger bg-danger/5 ring-1 ring-danger/30' : 'border-border-light'"
            :data-error="Boolean(errors['dynamic_' + field.id])"
            @change="onDropdownChange(field, $event)"
          >
            <option value="">Pilih {{ field.name_id || field.name }}</option>
            <option
              v-for="opt in field.list"
              :key="opt.id"
              :value="opt.id"
            >
              {{ opt.name_id || opt.name || opt.name_en }}
            </option>
          </select>
          <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
            <ChevronDown class="w-4 h-4" />
          </div>
          <p v-if="errors['dynamic_' + field.id]" class="mt-1 text-xs text-danger font-medium flex items-center gap-1">
            <AlertCircle class="w-3.5 h-3.5 shrink-0" />
            <span>{{ errors['dynamic_' + field.id] }}</span>
          </p>
        </div>

        <!-- Type 2: Textarea for longer fields (e.g. Catatan Minus) or Text Input -->
        <div v-else>
          <textarea
            v-if="isLongField(field.name_id || field.name)"
            :value="getAnswerText(field.id)"
            rows="3"
            :placeholder="`Masukkan ${field.name_id || field.name}`"
            class="w-full bg-white border rounded-xl p-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all resize-none leading-relaxed"
            :class="errors['dynamic_' + field.id] ? 'border-danger bg-danger/5 ring-1 ring-danger/30' : 'border-border-light'"
            :data-error="Boolean(errors['dynamic_' + field.id])"
            @input="onTextInput(field, ($event.target as HTMLTextAreaElement).value)"
          />
          <input
            v-else
            :value="getAnswerText(field.id)"
            type="text"
            :placeholder="`Masukkan ${field.name_id || field.name}`"
            class="w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
            :class="errors['dynamic_' + field.id] ? 'border-danger bg-danger/5 ring-1 ring-danger/30' : 'border-border-light'"
            :data-error="Boolean(errors['dynamic_' + field.id])"
            @input="onTextInput(field, ($event.target as HTMLInputElement).value)"
          />
          <p v-if="errors['dynamic_' + field.id]" class="mt-1 text-xs text-danger font-medium flex items-center gap-1">
            <AlertCircle class="w-3.5 h-3.5 shrink-0" />
            <span>{{ errors['dynamic_' + field.id] }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Empty dynamic forms placeholder if subcategory doesn't have custom forms -->
    <div
      v-else-if="!subcategoryName"
      class="p-4 rounded-xl border border-dashed border-border-light text-center text-xs text-text-muted"
    >
      Pilih kategori barang terlebih dahulu untuk memuat kolom spesifikasi spesifik.
    </div>

    <!-- Berat & Dimensi -->
    <div class="pt-2 border-t border-border-light space-y-3">
      <h4 class="text-xs font-bold text-text-primary uppercase tracking-wider">
        Berat & Dimensi
      </h4>

      <div>
        <label class="block text-xs font-semibold text-text-primary mb-1.5">
          Berat Produk (kg) <span class="text-danger">*</span>
        </label>
        <div class="relative max-w-xs">
          <input
            :value="weight"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.1"
            class="w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-text-primary focus:outline-none focus:border-primary transition-all"
            :class="errors.weight ? 'border-danger bg-danger/5' : 'border-border-light'"
            @input="$emit('update:weight', parseFloat(($event.target as HTMLInputElement).value || '0.1'))"
          />
          <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted font-bold pointer-events-none">
            kg
          </span>
        </div>
        <p v-if="errors.weight" class="mt-1 text-xs text-danger font-medium">{{ errors.weight }}</p>
        <p v-else class="mt-1 text-[11px] text-text-muted">
          Contoh: 0.1 kg untuk pakaian/buku tipis, 1 kg untuk laptop/sepatu.
        </p>
      </div>

      <!-- Dimensi P x L x T -->
      <div>
        <label class="block text-xs font-semibold text-text-primary mb-1.5">
          Dimensi Paket <span class="text-text-muted font-normal">(Opsional)</span>
        </label>
        <div class="grid grid-cols-3 gap-2">
          <div>
            <input
              :value="length"
              type="number"
              min="0"
              placeholder="P (cm)"
              class="w-full bg-white border border-border-light rounded-xl px-3 py-2 text-xs text-center text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
              @input="onDimensionChange('length', $event)"
            />
          </div>
          <div>
            <input
              :value="width"
              type="number"
              min="0"
              placeholder="L (cm)"
              class="w-full bg-white border border-border-light rounded-xl px-3 py-2 text-xs text-center text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
              @input="onDimensionChange('width', $event)"
            />
          </div>
          <div>
            <input
              :value="height"
              type="number"
              min="0"
              placeholder="T (cm)"
              class="w-full bg-white border border-border-light rounded-xl px-3 py-2 text-xs text-center text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
              @input="onDimensionChange('height', $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Notice Potongan Layanan -->
    <div class="p-3.5 rounded-xl bg-surface-2 border border-border-light text-xs text-text-muted leading-relaxed">
      <p>
        <strong class="text-text-primary">Potongan Layanan Transaksi {{ serviceFeePercent }}%</strong>
        <span v-if="subcategoryName"> untuk subkategori <strong>{{ subcategoryName }}</strong></span>.
        Biaya hanya dipotong dari saldo hasil penjualan saat pesanan berhasil selesai.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, AlertCircle } from 'lucide-vue-next'
import type { DynamicFormField, DynamicFormAnswer } from '~/types/post'

const props = defineProps<{
  dynamicForms: DynamicFormField[]
  dynamicAnswers: DynamicFormAnswer[]
  weight: number
  length: number | ''
  width: number | ''
  height: number | ''
  serviceFeePercent: number
  subcategoryName: string
  errors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:dynamicAnswers', val: DynamicFormAnswer[]): void
  (e: 'update:weight', val: number): void
  (e: 'update:length', val: number | ''): void
  (e: 'update:width', val: number | ''): void
  (e: 'update:height', val: number | ''): void
}>()

function isFieldRequired(field: DynamicFormField): boolean {
  if (String(field.type) === '1') return true
  const lower = (field.name_id || field.name || '').toLowerCase()
  if (lower.includes('opsional') || lower.includes('optional') || lower.includes('minus') || lower.includes('catatan')) {
    return false
  }
  return true
}

function isLongField(name: string) {
  const lower = (name || '').toLowerCase()
  return lower.includes('minus') || lower.includes('catatan') || lower.includes('riwayat')
}

function getAnswerId(fieldId: number | string): string | number {
  const found = props.dynamicAnswers.find((a) => String(a.id) === String(fieldId))
  return found?.answer_id ?? ''
}

function getAnswerText(fieldId: number | string): string {
  const found = props.dynamicAnswers.find((a) => String(a.id) === String(fieldId))
  return found?.answer ?? ''
}

function onDropdownChange(field: DynamicFormField, e: Event) {
  const val = (e.target as HTMLSelectElement).value
  const opt = field.list?.find((item) => String(item.id) === String(val))
  const newAnswers = [...props.dynamicAnswers]
  const idx = newAnswers.findIndex((a) => String(a.id) === String(field.id))

  const entry: DynamicFormAnswer = {
    id: field.id,
    type: field.type,
    answer: opt ? (opt.name_id || opt.name || opt.name_en || '') : '',
    answer_id: val || null,
  }

  if (idx >= 0) {
    newAnswers[idx] = entry
  } else {
    newAnswers.push(entry)
  }
  emit('update:dynamicAnswers', newAnswers)
}

function onTextInput(field: DynamicFormField, text: string) {
  const newAnswers = [...props.dynamicAnswers]
  const idx = newAnswers.findIndex((a) => String(a.id) === String(field.id))

  const entry: DynamicFormAnswer = {
    id: field.id,
    type: field.type,
    answer: text,
    answer_id: null,
  }

  if (idx >= 0) {
    newAnswers[idx] = entry
  } else {
    newAnswers.push(entry)
  }
  emit('update:dynamicAnswers', newAnswers)
}

function onDimensionChange(key: 'length' | 'width' | 'height', e: Event) {
  const val = (e.target as HTMLInputElement).value
  const num = val === '' ? '' : parseFloat(val)
  if (key === 'length') emit('update:length', num)
  if (key === 'width') emit('update:width', num)
  if (key === 'height') emit('update:height', num)
}
</script>

