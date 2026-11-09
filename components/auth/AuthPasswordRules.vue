<script setup lang="ts">
import { CheckCircle2, Circle, AlertTriangle } from 'lucide-vue-next'
import { usePasswordRules } from '~/composables/usePasswordRules'

const props = defineProps<{
  password: string
}>()

const passwordRef = computed(() => props.password || '')
const { rules, prohibitedCharFound } = usePasswordRules(passwordRef)
</script>

<template>
  <div class="rounded-xl bg-surface-2 border border-border p-3 space-y-2">
    <p class="text-[11px] font-semibold text-text">Syarat Kata Sandi:</p>

    <ul class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      <li
        v-for="rule in rules"
        :key="rule.key"
        class="flex items-center gap-1.5 text-[11px] transition-colors"
        :class="rule.passed ? 'text-emerald-700 font-semibold' : 'text-text-muted'"
      >
        <CheckCircle2 v-if="rule.passed" class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <Circle v-else class="w-3.5 h-3.5 text-text-muted/60 shrink-0" />
        <span>{{ rule.label }}</span>
      </li>
    </ul>

    <div
      v-if="prohibitedCharFound"
      class="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-red-600"
    >
      <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
      <span>Karakter "{{ prohibitedCharFound }}" tidak diizinkan pada kata sandi.</span>
    </div>
  </div>
</template>

