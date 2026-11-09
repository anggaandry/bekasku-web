<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  isDanger?: boolean
  loading?: boolean
}>(), {
  cancelLabel: 'Batal',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
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

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body" v-if="isMounted">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[95] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-outfit overscroll-contain"
      @click="close"
    >
      <div
        class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl px-5 pt-3 pb-6 shadow-xl animate-in fade-in zoom-in duration-150"
        @click.stop
      >
        <!-- Drag handle -->
        <div class="w-11 h-1 rounded-full bg-border mx-auto mb-4"></div>

        <h3 class="font-outfit font-semibold text-lg text-text mb-2">
          {{ title || 'Konfirmasi' }}
        </h3>
        <p class="font-outfit text-sm text-text-muted leading-relaxed mb-5">
          {{ description || 'Apakah Anda yakin ingin melanjutkan tindakan ini?' }}
        </p>

        <div class="flex items-center gap-3">
          <button
            type="button"
            :disabled="loading"
            class="flex-1 h-12 rounded-xl border border-border-light bg-white hover:bg-surface-2 font-outfit font-semibold text-sm text-text transition-colors cursor-pointer disabled:opacity-50"
            @click="close"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            :disabled="loading"
            class="flex-1 h-12 rounded-xl font-outfit font-semibold text-sm text-white transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50 bg-primary hover:bg-primary-dark"
            @click="handleConfirm"
          >
            <span v-if="loading">Memproses...</span>
            <span v-else>{{ confirmLabel || 'Ya, Lanjutkan' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

