import { OTP_RESEND_SECONDS } from '~/utils/constants'

export function useOtpTimer(defaultSeconds = OTP_RESEND_SECONDS) {
  const remainingSeconds = ref(0)
  let intervalId: ReturnType<typeof setInterval> | null = null

  const isRunning = computed(() => remainingSeconds.value > 0)

  const formattedTime = computed(() => {
    const mins = Math.floor(remainingSeconds.value / 60)
    const secs = remainingSeconds.value % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  })

  function stop() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function start(seconds = defaultSeconds) {
    stop()
    remainingSeconds.value = seconds
    if (!import.meta.client) return
    intervalId = setInterval(() => {
      if (remainingSeconds.value > 1) {
        remainingSeconds.value -= 1
      } else {
        remainingSeconds.value = 0
        stop()
      }
    }, 1000)
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    remainingSeconds,
    isRunning,
    formattedTime,
    start,
    stop,
  }
}

