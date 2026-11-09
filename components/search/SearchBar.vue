<template>
  <div class="w-full">
    <form class="relative w-full" @submit.prevent="onSubmit">
      <!-- Hidden file input for Visual Search -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onFileSelected"
      />

      <!-- Variant 1: Desktop Header Bar (Integrated Category Dropdown + Input + Camera + Red Cari CTA) -->
      <div
        v-if="variant === 'header-desktop'"
        class="relative flex items-center bg-white rounded-xl shadow-md p-1 border border-white/20 transition-all focus-within:ring-2 focus-within:ring-white/40 focus-within:shadow-lg"
      >
        <slot name="prepend" />

        <div class="relative flex-1 flex items-center min-w-0">
          <input
            :id="inputId"
            :value="modelValue"
            name="q"
            type="text"
            :placeholder="t(placeholder)"
            class="w-full min-w-0 bg-transparent text-text text-xs sm:text-sm pl-2.5 pr-2 py-1.5 placeholder-text-subtle focus:outline-none font-medium"
            @focus="emit('focus')"
            @input="onInput"
          />

          <button
            v-if="modelValue"
            type="button"
            class="p-1 text-text-subtle hover:text-text-muted rounded-full cursor-pointer mr-0.5"
            aria-label="Bersihkan kata kunci"
            @click="onClear"
          >
            <X class="w-3.5 h-3.5" />
          </button>

          <button
            v-if="showCamera"
            type="button"
            class="p-1.5 text-text-subtle hover:text-primary rounded-lg transition-colors cursor-pointer mr-1"
            title="Cari Produk dengan Foto"
            aria-label="Cari Produk dengan Foto"
            @click="triggerVisualPicker"
          >
            <Camera class="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          class="bg-primary hover:bg-primary-dark text-white px-3.5 sm:px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <Search class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">{{ t('Cari') }}</span>
        </button>
      </div>

      <!-- Variant 2: Mobile Header Bar (Compact White Squircle inside Red Mobile Header) -->
      <div
        v-else-if="variant === 'header-mobile'"
        class="flex items-center bg-white rounded-xl px-2.5 py-1.5 shadow-2xs w-full"
      >
        <Search class="w-4 h-4 text-text-subtle mr-1.5 shrink-0" />
        <input
          :id="inputId"
          :value="modelValue"
          name="q"
          type="text"
          :placeholder="t(placeholder)"
          :readonly="readonly"
          class="w-full bg-transparent text-text placeholder-text-subtle focus:outline-none text-xs font-medium"
          @click="readonly ? emit('clickInput') : undefined"
          @focus="emit('focus')"
          @input="onInput"
        />

        <button
          v-if="modelValue && !readonly"
          type="button"
          class="p-1 text-text-subtle hover:text-text-muted shrink-0 cursor-pointer"
          aria-label="Bersihkan"
          @click.stop="onClear"
        >
          <CircleX class="w-4 h-4" />
        </button>

        <button
          v-else-if="showCamera"
          type="button"
          class="p-1 text-text-subtle hover:text-primary transition-colors shrink-0 cursor-pointer"
          title="Cari Produk dengan Foto"
          aria-label="Cari Produk dengan Foto"
          @click.stop="triggerVisualPicker"
        >
          <Camera class="w-4 h-4" />
        </button>
      </div>

      <!-- Variant 3: Search Page & Search Result Bar -->
      <div
        v-else
        class="flex items-center bg-white rounded-[14px] h-[42px] px-3 border transition-colors w-full"
        :class="
          activeBorder || (modelValue && modelValue.trim().length > 0) || isFocused
            ? 'border-primary'
            : 'border-border-light'
        "
      >
        <Search class="w-[18px] h-[18px] text-text-muted mr-2.5 shrink-0" />
        <input
          :id="inputId"
          ref="mainInputRef"
          :value="modelValue"
          name="q"
          type="text"
          :placeholder="t(placeholder)"
          :readonly="readonly"
          :autofocus="autofocus"
          class="w-full bg-transparent text-text placeholder-text-subtle focus:outline-none text-sm font-outfit font-normal"
          :class="readonly ? 'cursor-pointer' : ''"
          @click="readonly ? emit('clickInput') : undefined"
          @focus="onFocusField"
          @blur="isFocused = false"
          @input="onInput"
        />

        <Loader2
          v-if="loading"
          class="w-4 h-4 text-primary animate-spin shrink-0 ml-1"
        />
        <button
          v-else-if="modelValue && !readonly"
          type="button"
          class="p-1 text-text-subtle hover:text-text-muted shrink-0 cursor-pointer"
          aria-label="Hapus teks pencarian"
          @click.stop="onClear"
        >
          <CircleX class="w-[18px] h-[18px]" />
        </button>
        <button
          v-else-if="showCamera && !readonly"
          type="button"
          class="p-1 text-primary hover:text-primary-dark shrink-0 cursor-pointer"
          title="Cari dengan Foto"
          aria-label="Cari dengan Foto"
          @click.stop="triggerVisualPicker"
        >
          <Camera class="w-[18px] h-[18px]" />
        </button>
      </div>

      <!-- Visual Search Validation Error Toast -->
      <p v-if="fileError" class="text-[11px] text-danger mt-1 font-medium">
        {{ fileError }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Search, Camera, X, CircleX, Loader2 } from 'lucide-vue-next'
import { useVisualSearch } from '~/composables/useVisualSearch'
import { useSearchStore } from '~/stores/search'

interface SearchBarProps {
  modelValue?: string
  placeholder?: string
  variant?: 'page' | 'header-desktop' | 'header-mobile'
  activeBorder?: boolean
  readonly?: boolean
  autofocus?: boolean
  loading?: boolean
  showCamera?: boolean
  inputId?: string
  categoryId?: string
  categoryName?: string
}

const props = withDefaults(defineProps<SearchBarProps>(), {
  modelValue: '',
  placeholder: 'Cari di BekasKu',
  variant: 'page',
  activeBorder: false,
  readonly: false,
  autofocus: false,
  loading: false,
  showCamera: true,
  inputId: 'bekasku-search-input',
  categoryId: '',
  categoryName: '',
})

const emit = defineEmits<{
  'update:modelValue': [val: string]
  submit: [val: string]
  clear: []
  focus: []
  clickInput: []
  visualSelected: [file: File]
}>()

const { validateImageFile } = useVisualSearch()
const searchStore = useSearchStore()
const { t } = useLocale()

const fileInputRef = ref<HTMLInputElement | null>(null)
const mainInputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const fileError = ref<string | null>(null)

function onFocusField() {
  isFocused.value = true
  emit('focus')
}

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  const sanitized = target.value.replace(/[<>]/g, '')
  if (sanitized !== target.value) {
    target.value = sanitized
  }
  emit('update:modelValue', sanitized)
}

function onClear() {
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    mainInputRef.value?.focus()
  })
}

function onSubmit() {
  if (props.readonly) {
    emit('clickInput')
    return
  }
  emit('submit', (props.modelValue || '').trim())
}

function triggerVisualPicker() {
  fileError.value = null
  fileInputRef.value?.click()
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const err = validateImageFile(file)
  if (err) {
    fileError.value = err
    input.value = ''
    return
  }

  fileError.value = null
  searchStore.setVisualFile(file)
  emit('visualSelected', file)

  const query: Record<string, string> = { mode: 'visual' }
  if (props.categoryId) query.category_id = props.categoryId
  if (props.categoryName) query.category_name = props.categoryName

  input.value = ''
  navigateTo({ path: '/search/result', query })
}

onMounted(() => {
  if (props.autofocus && !props.readonly) {
    nextTick(() => {
      mainInputRef.value?.focus()
    })
  }
})
</script>
