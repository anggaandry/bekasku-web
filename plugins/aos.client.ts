import AOS from 'aos'
import 'aos/dist/aos.css'

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.client) {
    nuxtApp.hook('app:mounted', () => {
      AOS.init({
        duration: 500,
        easing: 'ease-out-cubic',
        once: true,
        offset: 30,
        delay: 50,
      })
    })

    // Refresh AOS whenever route changes or DOM updates
    const router = useRouter()
    router.afterEach(() => {
      nextTick(() => {
        setTimeout(() => {
          AOS.refresh()
        }, 150)
      })
    })
  }
})
