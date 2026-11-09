<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, Clock, Globe, Headset, Mail, MapPin } from 'lucide-vue-next'
import type { HelpContactInfo } from '~/types/help'

const props = defineProps<{
  contact: HelpContactInfo
}>()

const emit = defineEmits<{
  (e: 'open-help-chat'): void
}>()

const formattedWorkingHour = computed(() => {
  const raw = String(props.contact.working_hour || '').trim()
  if (!raw) return 'Senin - Sabtu, 10:00 - 17:00 WIB'
  return /wib/i.test(raw) ? raw : `${raw} WIB`
})

function safeExternalLink(url: string): string {
  const raw = String(url || '').trim()
  if (/^https?:\/\//i.test(raw)) return raw
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(raw)) return `https://${raw}`
  return ''
}

const safeEmail = computed(() => {
  const raw = String(props.contact.email || '').trim().replace(/[\r\n\s]/g, '')
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) ? raw : ''
})

const validSocmed = computed(() =>
  (props.contact.socmed || [])
    .map(sm => ({ ...sm, href: safeExternalLink(sm.link) }))
    .filter(sm => Boolean(sm.href && sm.title)),
)
</script>

<template>
  <aside class="space-y-4 font-outfit">
    <!-- Primary Support Card ("Belum menemukan jawaban?" matching faq_view.dart) -->
    <div class="bg-white rounded-2xl border border-border overflow-hidden shadow-2xs">
      <div class="px-5 py-4 border-b border-border bg-white">
        <h2 class="font-outfit font-bold text-base text-text">
          Belum menemukan jawaban?
        </h2>
        <p class="font-outfit text-xs text-text-muted mt-1 leading-relaxed">
          Hubungi tim Customer Support resmi BekasKu melalui saluran di bawah ini.
        </p>
      </div>

      <div class="divide-y divide-border">
        <!-- 1. In-App Live Chat BekasKu Center -->
        <button
          type="button"
          class="w-full min-h-[60px] px-5 py-3.5 flex items-center gap-3.5 text-left hover:bg-chip-soft-bg/60 transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-primary"
          @click="emit('open-help-chat')"
        >
          <div class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Headset class="w-5 h-5" aria-hidden="true" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-outfit font-semibold text-sm text-text group-hover:text-primary transition-colors">
              Chat BekasKu Center
            </p>
            <p class="font-outfit text-xs text-text-muted truncate">
              Chat langsung dengan tim BekasKu
            </p>
          </div>
          <ChevronRight class="w-4 h-4 text-text-muted group-hover:text-primary shrink-0" aria-hidden="true" />
        </button>

        <!-- 2. Support Email -->
        <a
          v-if="safeEmail"
          :href="`mailto:${safeEmail}`"
          class="w-full min-h-[60px] px-5 py-3.5 flex items-center gap-3.5 text-left hover:bg-surface-2 transition-colors group"
        >
          <div class="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text shrink-0">
            <Mail class="w-5 h-5" aria-hidden="true" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-outfit font-semibold text-sm text-text group-hover:text-primary transition-colors">
              Email Resmi
            </p>
            <p class="font-outfit text-xs text-text-muted truncate">
              {{ safeEmail }}
            </p>
          </div>
          <ChevronRight class="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
        </a>

        <!-- 3. Official Website -->
        <a
          href="https://www.bekasku.id"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full min-h-[60px] px-5 py-3.5 flex items-center gap-3.5 text-left hover:bg-surface-2 transition-colors group"
        >
          <div class="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text shrink-0">
            <Globe class="w-5 h-5" aria-hidden="true" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-outfit font-semibold text-sm text-text group-hover:text-primary transition-colors">
              Website
            </p>
            <p class="font-outfit text-xs text-text-muted truncate">
              Pelajari lebih lanjut di website BekasKu
            </p>
          </div>
          <ChevronRight class="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
        </a>
      </div>
    </div>

    <!-- Operating Hours & Office Info from /socmed -->
    <div class="bg-white rounded-2xl border border-border p-5 space-y-3.5 shadow-2xs">
      <div class="flex items-start gap-3">
        <Clock class="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p class="font-outfit font-semibold text-xs text-text">Jam Operasional CS</p>
          <p class="font-outfit text-xs text-text-muted mt-0.5">
            {{ formattedWorkingHour }}
          </p>
        </div>
      </div>

      <div v-if="props.contact.address" class="flex items-start gap-3">
        <MapPin class="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p class="font-outfit font-semibold text-xs text-text">Kantor Pusat</p>
          <p class="font-outfit text-xs text-text-muted mt-0.5 leading-relaxed">
            {{ props.contact.address }}
          </p>
        </div>
      </div>

      <div
        v-if="validSocmed.length > 0"
        class="pt-3 border-t border-border space-y-2"
      >
        <p class="font-outfit font-semibold text-xs text-text">Kanal Resmi</p>
        <div class="flex flex-wrap gap-2">
          <a
            v-for="sm in validSocmed"
            :key="sm._id || sm.href"
            :href="sm.href"
            target="_blank"
            rel="noopener noreferrer"
            class="min-h-[44px] md:min-h-[36px] px-3 py-1.5 rounded-full bg-surface-2 hover:bg-chip-soft-bg border border-border hover:border-primary/40 font-outfit text-xs font-medium text-text hover:text-primary inline-flex items-center gap-1.5 transition-colors"
          >
            <span>{{ sm.title }}</span>
            <span v-if="sm.description" class="text-text-muted">{{ sm.description }}</span>
          </a>
        </div>
      </div>
    </div>
  </aside>
</template>
