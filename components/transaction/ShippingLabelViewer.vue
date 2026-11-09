<script setup lang="ts">
import { Printer, Download, X, ExternalLink } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  pdfUrl: string
  invoiceNo?: string
  waybill?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

function handleClose() {
  emit('update:modelValue', false)
}

function handlePrint() {
  const iframe = document.getElementById('label-print-frame') as HTMLIFrameElement | null
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.print()
  } else {
    window.open(props.pdfUrl, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      @click="handleClose"
    >
      <div
        class="bg-white w-full max-w-3xl h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        @click.stop
      >
        <!-- Modal Top Bar -->
        <div class="px-5 py-4 border-b border-border flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 class="font-outfit font-bold text-base text-text">
              Label Pengiriman
            </h3>
            <p class="font-outfit text-xs text-text-muted">
              {{ invoiceNo }} <span v-if="waybill">&bull; Resi: {{ waybill }}</span>
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-lg border border-border hover:border-primary text-xs font-outfit font-semibold text-text hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
              @click="handlePrint"
            >
              <Printer class="w-4 h-4" />
              <span>Cetak</span>
            </button>

            <a
              :href="pdfUrl"
              target="_blank"
              rel="noopener noreferrer"
              download
              class="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-xs font-outfit font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Download class="w-4 h-4" />
              <span>Unduh</span>
            </a>

            <button
              type="button"
              class="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text cursor-pointer transition-colors ml-2"
              @click="handleClose"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- PDF Viewer Content -->
        <div class="flex-1 bg-surface-2 relative overflow-hidden">
          <iframe
            id="label-print-frame"
            :src="pdfUrl"
            class="w-full h-full border-none"
            title="Label Pengiriman"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

