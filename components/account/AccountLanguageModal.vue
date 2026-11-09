<template>
  <AppModal
    v-model="isOpen"
    :title="t('Bahasa / Language')"
  >
    <div class="space-y-2.5 select-none font-outfit">
      <p class="text-xs text-text-muted leading-relaxed mb-3">
        {{ t('Pilih bahasa aplikasi yang ingin Anda gunakan di BekasKu.') }}
      </p>

      <button
        v-for="item in locales"
        :key="item.code"
        type="button"
        class="w-full flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer text-left"
        :class="
          locale === item.code
            ? 'border-primary bg-chip-soft-bg text-primary-dark font-bold shadow-2xs'
            : 'border-border bg-surface hover:bg-surface-2 text-text font-medium'
        "
        @click="selectLang(item.code)"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-colors"
            :class="
              locale === item.code
                ? 'bg-primary text-white border-primary'
                : 'bg-surface-2 text-text border-border'
            "
          >
            {{ item.shortLabel }}
          </div>
          <div>
            <p class="text-xs sm:text-sm font-bold text-text">
              {{ item.label }}
            </p>
            <p class="text-[11px] text-text-muted">
              {{ item.nativeName }}
            </p>
          </div>
        </div>
        <Check
          v-if="locale === item.code"
          class="w-4 h-4 text-primary shrink-0"
          aria-hidden="true"
        />
      </button>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import AppModal from '~/components/shared/AppModal.vue'
import { useLocale, type AppLocale } from '~/composables/useLocale'
import { useNotification } from '~/composables/useNotification'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { locale, locales, setLocale, t } = useLocale()
const { showNotification } = useNotification()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function selectLang(code: AppLocale) {
  setLocale(code)
  const selected = locales.find(item => item.code === code)
  showNotification({
    type: 'success',
    message: `${t('Bahasa aplikasi berhasil diubah ke')} ${selected?.label || code}`,
  })
  isOpen.value = false
}
</script>
