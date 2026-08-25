import { ref, onMounted, onUnmounted, computed } from 'vue'

export interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

export function useCountdown(targetDateInput?: string | Date) {
  // Default target: 3 bulan dari 25 Agustus 2026 -> 25 November 2026
  const targetDate = targetDateInput
    ? new Date(targetDateInput).getTime()
    : new Date('2026-11-25T00:00:00+07:00').getTime()

  const now = ref(Date.now())
  let intervalId: ReturnType<typeof setInterval> | null = null

  const updateNow = () => {
    now.value = Date.now()
  }

  onMounted(() => {
    updateNow()
    intervalId = setInterval(updateNow, 1000)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  const timeLeft = computed<CountdownTime>(() => {
    const diff = targetDate - now.value

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      }
    }

    const seconds = Math.floor((diff / 1000) % 60)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
    }
  })

  const padZero = (n: number) => n.toString().padStart(2, '0')

  return {
    timeLeft,
    padZero,
  }
}
