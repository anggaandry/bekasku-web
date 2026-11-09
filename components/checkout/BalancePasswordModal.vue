<script setup lang="ts">
import { X, Lock, Eye, EyeOff } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    loading?: boolean
    error?: string
    title?: string
    description?: string
  }>(),
  {
    loading: false,
    error: '',
    title: 'Verifikasi Password',
    description: 'Masukkan password akun Anda untuk mengonfirmasi pembayaran menggunakan saldo BekasKu Wallet.',
  }
)

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  submit: [password: string]
}>()

const password = ref('')
const showPassword = ref(false)

function close() {
  password.value = ''
  emit('update:modelValue', false)
}

function handleSubmit() {
  if (!password.value.trim() || props.loading) return
  emit('submit', password.value)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="props.modelValue"
        class="fixed inset-0 z-[85] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-outfit overscroll-contain"
        @click.self="close"
      >
        <div class="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-border">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <h3 class="text-base font-bold text-text font-outfit flex items-center gap-2">
              <Lock class="w-4 h-4 text-primary" />
              <span>{{ props.title }}</span>
            </h3>
            <button
              type="button"
              class="p-1 rounded-full text-text-muted hover:text-text cursor-pointer"
              @click="close"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="py-4 space-y-4">
            <p class="text-xs text-text-muted leading-relaxed">
              {{ props.description }}
            </p>

            <!-- Password Input -->
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password akun"
                class="w-full h-11 px-3.5 pr-10 rounded-xl border border-border bg-surface-2 text-xs sm:text-sm text-text focus:outline-hidden focus:border-primary transition-colors"
                @keyup.enter="handleSubmit"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>

            <!-- Error message -->
            <p v-if="props.error" class="text-xs text-danger font-medium">
              {{ props.error }}
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              class="flex-1 h-11 rounded-xl border border-border-light bg-white hover:bg-surface-2 text-xs font-semibold text-text transition-colors cursor-pointer"
              @click="close"
            >
              Batal
            </button>
            <button
              type="button"
              :disabled="!password.trim() || props.loading"
              class="flex-1 h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold font-outfit transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              @click="handleSubmit"
            >
              <span v-if="props.loading">Memverifikasi...</span>
              <span v-else>Konfirmasi</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

