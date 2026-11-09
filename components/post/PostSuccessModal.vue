<template>
  <AppModal
    :model-value="modelValue"
    max-width="max-w-md"
    :show-close-button="true"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="py-3 px-1 text-center font-outfit space-y-5">
      <!-- Success Icon -->
      <div class="w-20 h-20 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs animate-in zoom-in-75 duration-300">
        <CircleCheck class="w-12 h-12 stroke-[2.2]" />
      </div>

      <!-- Title & Message -->
      <div class="space-y-2">
        <h3 class="text-xl sm:text-2xl font-extrabold text-text">
          {{ isEdit ? 'Iklan Berhasil Diperbarui!' : 'Posting Iklan Berhasil!' }}
        </h3>
        <p class="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
          {{
            isEdit
              ? 'Perubahan produk kamu telah disimpan dan informasi terbaru sudah langsung tayang.'
              : 'Iklanmu sedang dalam proses verifikasi dan akan segera ditayangkan.'
          }}
        </p>
      </div>

      <!-- Action Buttons (Mobile V3 parity) -->
      <div class="space-y-2.5 pt-2">
        <NuxtLink
          to="/catalog"
          class="w-full py-3 px-5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
          @click="emit('update:modelValue', false)"
        >
          <LayoutList class="w-4 h-4 shrink-0" />
          <span>Lihat Katalog Saya</span>
        </NuxtLink>

        <NuxtLink
          to="/"
          class="w-full py-2.5 px-5 bg-white hover:bg-surface-2 text-text border border-border-light text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
          @click="emit('update:modelValue', false)"
        >
          <Home class="w-4 h-4 shrink-0 text-text-muted" />
          <span>Kembali ke Beranda</span>
        </NuxtLink>

        <button
          v-if="!isEdit"
          type="button"
          class="w-full py-2 px-5 text-primary hover:text-primary-dark text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
          @click="handlePostAnother"
        >
          <Plus class="w-3.5 h-3.5 shrink-0" />
          <span>Pasang Iklan Lain</span>
        </button>
      </div>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { CircleCheck, LayoutList, Home, Plus } from 'lucide-vue-next'
import AppModal from '~/components/shared/AppModal.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    isEdit?: boolean
  }>(),
  {
    isEdit: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'post-another'): void
}>()

function handlePostAnother() {
  emit('update:modelValue', false)
  emit('post-another')
}
</script>

