import { defineStore } from 'pinia'
import { DEFAULT_LOCATION } from '~/utils/constants'

export type AppMode = 'coming_soon' | 'sandbox' | 'production' | 'full_web'

export const useAppStore = defineStore('app', () => {
  const config = useRuntimeConfig()
  const initialMode = (config.public.mode as AppMode) || 'coming_soon'

  const mode = ref<AppMode>(initialMode)
  const isSearchOpen = ref(false)
  const searchQuery = ref('')
  const currentCity = ref<string>(DEFAULT_LOCATION)
  const activeMobileTab = ref<'home' | 'kategori' | 'jual' | 'transaksi' | 'profil'>('home')

  // Mode status
  const isComingSoon = computed(() => mode.value === 'coming_soon')
  const isEcommerce = computed(() => mode.value !== 'coming_soon')

  function setMode(newMode: AppMode) {
    mode.value = newMode
  }

  function setCurrentCity(city: string) {
    currentCity.value = city
  }

  function toggleSearch(open?: boolean) {
    isSearchOpen.value = open !== undefined ? open : !isSearchOpen.value
  }

  return {
    mode,
    isComingSoon,
    isEcommerce,
    isSearchOpen,
    searchQuery,
    currentCity,
    activeMobileTab,
    setMode,
    setCurrentCity,
    toggleSearch,
  }
})
