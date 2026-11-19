export const useAccountDrawer = () => {
  const isOpen = useState<boolean>('account_drawer_open', () => false)
  const route = useRoute()
  const router = useRouter()

  const isMobileViewport = () => import.meta.client && window.innerWidth < 768

  const open = () => {
    isOpen.value = true
    if (isMobileViewport() && route.query.drawer !== 'account') {
      router.push({ query: { ...route.query, drawer: 'account' } })
    }
  }

  const close = () => {
    isOpen.value = false
    if (isMobileViewport() && route.query.drawer === 'account') {
      if (window.history.state?.back) {
        router.back()
      } else {
        router.replace({ query: { ...route.query, drawer: undefined } })
      }
    }
  }

  const closeForNavigation = () => {
    isOpen.value = false
  }

  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  return {
    isOpen,
    open,
    close,
    closeForNavigation,
    toggle,
  }
}

