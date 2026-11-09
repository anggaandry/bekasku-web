<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight, Check, FileText, Headset, Link2, List } from 'lucide-vue-next'
import AppModal from '~/components/shared/AppModal.vue'
import { useHelpChatStore } from '~/stores/helpChat'
import type { LegalLanguage, LegalSectionMeta } from '~/types/legal'

const props = withDefaults(
  defineProps<{
    sections: LegalSectionMeta[]
    activeSectionId: string
    lang?: LegalLanguage
    showPrivacyDeletionBox?: boolean
  }>(),
  {
    lang: 'id',
    showPrivacyDeletionBox: false,
  },
)

const helpChatStore = useHelpChatStore()
const { showNotification } = useNotification()

const isMobileTocOpen = ref(false)
const copiedSectionId = ref('')

function scrollToSection(id: string) {
  isMobileTocOpen.value = false
  if (!import.meta.client) return
  nextTick(() => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`)
    }
  })
}

async function copySectionLink(id: string) {
  if (!import.meta.client) return
  const link = `${window.location.origin}${window.location.pathname}${window.location.search}#${id}`
  try {
    await navigator.clipboard.writeText(link)
    copiedSectionId.value = id
    showNotification({
      type: 'success',
      message: props.lang === 'en' ? 'Section link copied.' : 'Tautan pasal berhasil disalin.',
    })
    setTimeout(() => {
      if (copiedSectionId.value === id) copiedSectionId.value = ''
    }, 2000)
  } catch {
    showNotification({
      type: 'error',
      message: props.lang === 'en' ? 'Unable to copy section link.' : 'Gagal menyalin tautan pasal.',
    })
  }
}

function handleOpenHelpChat() {
  helpChatStore.openHelpChat({ topic: 'general' })
}
</script>

<template>
  <!-- Single Sticky Sidebar Card -->
  <aside class="hidden lg:block lg:col-span-4 lg:sticky lg:top-[118px] font-outfit print:hidden">
    <div class="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
      <div class="flex items-center justify-between gap-2 pb-3 border-b border-border">
        <h2 class="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-2">
          <FileText class="w-4 h-4 text-primary-dark" aria-hidden="true" />
          <span>{{ props.lang === 'en' ? 'Table of Contents' : 'Daftar Isi Pasal' }}</span>
        </h2>
        <span class="text-xs font-semibold text-text-muted">
          {{ props.sections.length }}
        </span>
      </div>

      <nav
        aria-label="Daftar isi dokumen"
        class="space-y-1 max-h-[calc(100vh-23rem)] overflow-y-auto pr-1"
      >
        <div
          v-for="item in props.sections"
          :key="item.id"
          class="flex items-center gap-1 group rounded-xl transition-colors"
          :class="
            props.activeSectionId === item.id
              ? 'bg-chip-soft-bg text-primary-dark font-bold'
              : 'text-text-muted hover:text-text hover:bg-surface-2 font-medium'
          "
        >
          <a
            :href="`#${item.id}`"
            class="flex-1 min-w-0 py-2.5 px-3 text-xs leading-snug truncate"
            @click.prevent="scrollToSection(item.id)"
          >
            {{ item.title }}
          </a>

          <button
            type="button"
            class="w-8 h-8 mr-1 rounded-lg flex items-center justify-center shrink-0 opacity-60 group-hover:opacity-100 hover:bg-white transition-all cursor-pointer"
            :title="props.lang === 'en' ? 'Copy section link' : 'Salin tautan pasal'"
            :aria-label="props.lang === 'en' ? `Copy link ${item.title}` : `Salin tautan ${item.title}`"
            @click.stop="copySectionLink(item.id)"
          >
            <Check v-if="copiedSectionId === item.id" class="w-3.5 h-3.5 text-success" aria-hidden="true" />
            <Link2 v-else class="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <!-- Compact Action Links Inside Same Card -->
      <div class="pt-3 border-t border-border space-y-2">
        <NuxtLink
          v-if="props.showPrivacyDeletionBox"
          to="/account?tab=delete"
          class="min-h-[44px] px-2 flex items-center justify-between text-xs font-semibold text-primary-dark hover:underline rounded-lg"
        >
          <span>{{ props.lang === 'en' ? 'Request Account Deletion' : 'Ajukan Penghapusan Akun' }}</span>
          <ArrowRight class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </NuxtLink>

        <button
          type="button"
          class="w-full min-h-[44px] rounded-xl border border-border bg-surface-2 hover:border-primary/40 hover:text-primary-dark text-text font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          @click="handleOpenHelpChat"
        >
          <Headset class="w-4 h-4 text-primary-dark" aria-hidden="true" />
          <span>{{ props.lang === 'en' ? 'Ask BekasKu Center' : 'Tanya BekasKu Center' }}</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- Mobile Floating TOC Trigger (< lg) -->
  <div class="lg:hidden fixed bottom-5 left-4 z-30 print:hidden">
    <button
      type="button"
      class="min-h-[44px] px-4 rounded-full bg-text hover:bg-dark text-white font-outfit font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer"
      :aria-label="props.lang === 'en' ? 'Open Table of Contents' : 'Buka Daftar Isi Pasal'"
      @click="isMobileTocOpen = true"
    >
      <List class="w-4 h-4" aria-hidden="true" />
      <span>{{ props.lang === 'en' ? 'Contents' : 'Daftar Isi' }}</span>
    </button>
  </div>

  <!-- Mobile TOC Bottom Sheet / Modal -->
  <AppModal
    v-model="isMobileTocOpen"
    :title="props.lang === 'en' ? 'Table of Contents' : 'Daftar Isi Pasal'"
    max-width="max-w-lg"
  >
    <nav class="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
      <div
        v-for="item in props.sections"
        :key="item.id"
        class="flex items-center gap-2 rounded-xl"
        :class="props.activeSectionId === item.id ? 'bg-chip-soft-bg text-primary-dark font-bold' : 'text-text hover:bg-surface-2'"
      >
        <a
          :href="`#${item.id}`"
          class="flex-1 min-w-0 min-h-[44px] flex items-center px-3 text-xs leading-snug"
          @click.prevent="scrollToSection(item.id)"
        >
          {{ item.title }}
        </a>
        <button
          type="button"
          class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 text-text-muted hover:text-primary-dark cursor-pointer"
          :aria-label="props.lang === 'en' ? `Copy link ${item.title}` : `Salin tautan ${item.title}`"
          @click.stop="copySectionLink(item.id)"
        >
          <Check v-if="copiedSectionId === item.id" class="w-4 h-4 text-success" aria-hidden="true" />
          <Link2 v-else class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  </AppModal>
</template>
