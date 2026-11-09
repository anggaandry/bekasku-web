<script setup lang="ts">
defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [provider: 'google' | 'apple']
}>()
</script>

<template>
  <div class="mt-5">
    <div class="flex items-center gap-3 my-4">
      <div class="h-px flex-1 bg-border" />
      <span class="text-[11px] font-medium text-text-muted shrink-0">
        Atau masuk dengan
      </span>
      <div class="h-px flex-1 bg-border" />
    </div>

    <div class="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        :disabled="loading"
        class="h-10 px-3 rounded-xl border border-border bg-white hover:bg-surface-2 text-text text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        @click="emit('select', 'google')"
      >
        <img
          src="/images/auth/google_login.png"
          alt="Google"
          width="18"
          height="18"
          class="w-4.5 h-4.5 object-contain shrink-0"
        />
        <span>Google</span>
      </button>

      <button
        type="button"
        :disabled="loading"
        class="h-10 px-3 rounded-xl border border-border bg-white hover:bg-surface-2 text-text text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        @click="emit('select', 'apple')"
      >
        <img
          src="/images/auth/apple_login.png"
          alt="Apple"
          width="18"
          height="18"
          class="w-4.5 h-4.5 object-contain shrink-0"
        />
        <span>Apple</span>
      </button>
    </div>
  </div>
</template>
