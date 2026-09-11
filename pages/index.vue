<template>
  <!-- 1. COMING SOON MODE (Default) -->
  <div
    v-if="isComingSoon"
    class="min-h-screen lg:h-screen lg:max-h-screen w-full bg-[#E31B23] text-white flex flex-col justify-between selection:bg-white selection:text-[#E31B23] font-['Poppins'] relative overflow-hidden"
  >
    <!-- Interactive Particle & Light Canvas -->
    <canvas
      ref="canvasRef"
      class="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-75"
    ></canvas>

    <!-- Header: Logo Icon & Text with balanced padding -->
    <header class="w-full px-8 sm:px-14 lg:px-20 xl:px-24 pt-6 sm:pt-7 z-10">
      <div class="flex items-center gap-3">
        <img
          src="/images/icon_only.png"
          alt="Bekasku Icon"
          class="h-8 sm:h-9 w-auto object-contain brightness-0 invert"
        />
        <span class="text-2xl sm:text-3xl font-bold tracking-tight text-white">Bekasku</span>
      </div>
    </header>

    <!-- Main Content -->
    <main class="w-full px-8 sm:px-14 lg:px-20 xl:px-24 py-4 sm:py-6 my-auto z-10 flex-grow flex items-center">
      <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        
        <!-- Left Column: Title, Subtitle, Countdown & Store Buttons (5 cols on lg) -->
        <div class="lg:col-span-5 space-y-6 text-center lg:text-left">
          
          <!-- Headline & Description -->
          <div class="space-y-3">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.14]">
              Bekasku Web <br />
              Segera Hadir!
            </h1>
            <p class="text-sm sm:text-base text-red-100 max-w-lg mx-auto lg:mx-0 font-normal leading-relaxed">
              Marketplace jual beli barang bekas dan preloved terpercaya #1 di Indonesia. Nikmati transaksi aman dan mudah langsung dari browser Anda.
            </p>
          </div>

          <!-- Countdown Timer -->
          <div class="max-w-md mx-auto lg:mx-0">
            <div class="grid grid-cols-4 gap-2.5 sm:gap-3 text-center">
              <div class="timer-card p-2.5 sm:p-3 flex flex-col items-center">
                <span class="text-2xl sm:text-3xl font-bold text-white tracking-tight">{{ padZero(timeLeft.days) }}</span>
                <span class="text-[10px] sm:text-[11px] font-normal text-red-100 uppercase tracking-wider mt-0.5">Hari</span>
              </div>
              <div class="timer-card p-2.5 sm:p-3 flex flex-col items-center">
                <span class="text-2xl sm:text-3xl font-bold text-white tracking-tight">{{ padZero(timeLeft.hours) }}</span>
                <span class="text-[10px] sm:text-[11px] font-normal text-red-100 uppercase tracking-wider mt-0.5">Jam</span>
              </div>
              <div class="timer-card p-2.5 sm:p-3 flex flex-col items-center">
                <span class="text-2xl sm:text-3xl font-bold text-white tracking-tight">{{ padZero(timeLeft.minutes) }}</span>
                <span class="text-[10px] sm:text-[11px] font-normal text-red-100 uppercase tracking-wider mt-0.5">Menit</span>
              </div>
              <div class="timer-card p-2.5 sm:p-3 flex flex-col items-center">
                <span class="text-2xl sm:text-3xl font-bold text-white tracking-tight">{{ padZero(timeLeft.seconds) }}</span>
                <span class="text-[10px] sm:text-[11px] font-normal text-red-100 uppercase tracking-wider mt-0.5">Detik</span>
              </div>
            </div>
          </div>

          <!-- Download Mobile App (Large Buttons) -->
          <div class="space-y-2.5 pt-1">
            <p class="text-xs sm:text-sm font-medium text-red-100">
              Download aplikasi mobile Bekasku sekarang:
            </p>
            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              
              <!-- Google Play / Android Button -->
              <a
                :href="config.public.playStoreUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3.5 px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-slate-900/95 hover:bg-slate-900 text-white transition-all duration-200 border border-white/20 shadow-xl hover:scale-[1.03] active:scale-[0.98] group"
              >
                <!-- Android Robot SVG Icon -->
                <div class="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" class="w-5 h-5 sm:w-6 sm:h-6 fill-[#3DDC84]" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-1.0002s.4482-.9998.9993-.9998c.5516 0 .9997.4482.9997.9998s-.4481 1.0002-.9997 1.0002m-11.046 0c-.5511 0-.9993-.4486-.9993-1.0002s.4482-.9998.9993-.9998c.5516 0 .9997.4482.9997.9998s-.4481 1.0002-.9997 1.0002m11.4045-6.02l1.996-3.457c.1056-.183.0427-.417-.1403-.5225-.183-.1055-.417-.0428-.5225.1402l-2.0252 3.508C15.5898 8.441 13.844 8.136 12 8.136c-1.844 0-3.5898.305-5.1895.8541L4.7853 5.4821c-.1055-.183-.3395-.2457-.5225-.1402-.183.1055-.2459.3395-.1403.5225l1.996 3.457C2.688 11.2335.3435 15.228.3435 19.824h23.313c0-4.596-2.3445-8.5905-5.776-10.5026"/>
                  </svg>
                </div>
                <div class="text-left">
                  <span class="block text-[9px] sm:text-[10px] font-normal text-slate-300 leading-none">Download di</span>
                  <span class="block text-xs sm:text-sm font-bold text-white leading-tight mt-0.5">Google Play</span>
                </div>
              </a>

              <!-- Apple App Store Button -->
              <a
                :href="config.public.appStoreUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3.5 px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-slate-900/95 hover:bg-slate-900 text-white transition-all duration-200 border border-white/20 shadow-xl hover:scale-[1.03] active:scale-[0.98] group"
              >
                <!-- Apple Logo SVG Icon -->
                <div class="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shrink-0 text-white">
                  <Apple class="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                </div>
                <div class="text-left">
                  <span class="block text-[9px] sm:text-[10px] font-normal text-slate-300 leading-none">Download di</span>
                  <span class="block text-xs sm:text-sm font-bold text-white leading-tight mt-0.5">App Store</span>
                </div>
              </a>

            </div>
          </div>

        </div>

        <!-- Right Column: 4-Phone Perspective Showcase (7 cols on lg) -->
        <div class="lg:col-span-7 flex items-center justify-center relative py-6 lg:py-0 overflow-visible">
          
          <div class="relative w-full flex items-center justify-center -space-x-12 sm:-space-x-16 lg:-space-x-20">
            
            <!-- Phone 1: Search & Filter (search_red.png) -->
            <div class="phone-mockup w-[150px] sm:w-[190px] lg:w-[220px] xl:w-[240px] p-1.5 sm:p-2 animate-phone-1 z-10">
              <div class="relative w-full rounded-[1.4rem] overflow-hidden bg-slate-950 max-h-[320px] sm:max-h-[420px] lg:max-h-[480px] overflow-y-auto scrollbar-none shadow-2xl">
                <img
                  src="/search_red.png"
                  alt="Bekasku Search Screen"
                  class="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>
            </div>

            <!-- Phone 2: Home Screen (home_red.png) -->
            <div class="phone-mockup w-[155px] sm:w-[195px] lg:w-[225px] xl:w-[245px] p-1.5 sm:p-2 animate-phone-2 z-20">
              <div class="relative w-full rounded-[1.4rem] overflow-hidden bg-slate-950 max-h-[330px] sm:max-h-[430px] lg:max-h-[490px] overflow-y-auto scrollbar-none shadow-2xl">
                <img
                  src="/home_red.png"
                  alt="Bekasku Home Screen"
                  class="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>
            </div>

            <!-- Phone 3: Promo & Deals (promo_red.png) -->
            <div class="phone-mockup w-[160px] sm:w-[200px] lg:w-[230px] xl:w-[250px] p-1.5 sm:p-2 animate-phone-3 z-30 shadow-[0_25px_50px_-10px_rgba(0,0,0,0.7)]">
              <div class="relative w-full rounded-[1.4rem] overflow-hidden bg-slate-950 max-h-[340px] sm:max-h-[440px] lg:max-h-[500px] overflow-y-auto scrollbar-none shadow-2xl">
                <img
                  src="/promo_red.png"
                  alt="Bekasku Promo Screen"
                  class="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>
            </div>

            <!-- Phone 4: Profile & Akun (profile_red.png) -->
            <div class="phone-mockup w-[150px] sm:w-[190px] lg:w-[220px] xl:w-[240px] p-1.5 sm:p-2 animate-phone-4 z-20">
              <div class="relative w-full rounded-[1.4rem] overflow-hidden bg-slate-950 max-h-[320px] sm:max-h-[420px] lg:max-h-[480px] overflow-y-auto scrollbar-none shadow-2xl">
                <img
                  src="/profile_red.png"
                  alt="Bekasku Profile Screen"
                  class="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>

    <!-- Footer with matching balanced margins -->
    <footer class="w-full px-8 sm:px-14 lg:px-20 xl:px-24 pb-5 pt-3 text-center text-xs text-red-100 z-10 flex flex-wrap items-center justify-center gap-3">
      <p>&copy; {{ new Date().getFullYear() }} Bekasku. Seluruh Hak Cipta Dilindungi.</p>
      <span class="hidden sm:inline-block text-red-300">&bull;</span>
      <NuxtLink to="/terms" class="text-white hover:text-red-200 underline underline-offset-4 font-medium transition-colors">
        Syarat &amp; Ketentuan
      </NuxtLink>
    </footer>
  </div>

  <!-- 2. FULL WEB MODE (Saat rilis penuh) -->
  <div v-else class="min-h-screen bg-slate-50 text-slate-900 font-['Poppins']">
    <header class="w-full bg-[#E31B23] text-white px-6 py-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img src="/images/icon_only.png" alt="Bekasku" class="h-8 w-auto brightness-0 invert" />
          <span class="text-xl font-bold">Bekasku</span>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-12">
      <h2 class="text-2xl font-bold">Selamat Datang di Bekasku Web</h2>
      <p class="text-slate-600 mt-2">Platform marketplace barang bekas & preloved.</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Apple } from 'lucide-vue-next'
import { useCountdown } from '~/composables/useCountdown'

const config = useRuntimeConfig()
const isComingSoon = computed(() => (config.public.mode || 'coming_soon') === 'coming_soon')
const { timeLeft, padZero } = useCountdown(config.public.launchDate)

// Canvas Interactive Particle & Cursor Follower Effect
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number | null = null

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  baseAlpha: number
}

onMounted(() => {
  if (typeof window === 'undefined' || !canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  const handleResize = () => {
    if (!canvas) return
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
    initParticles()
  }
  window.addEventListener('resize', handleResize)

  // Cursor state with smooth interpolation (lerp)
  const mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    radius: 140,
  }

  const handlePointerMove = (e: MouseEvent) => {
    mouse.targetX = e.clientX
    mouse.targetY = e.clientY
  }
  window.addEventListener('mousemove', handlePointerMove)

  // Initialize gentle ambient floating particles
  let particles: Particle[] = []
  const particleCount = Math.min(Math.floor((width * height) / 18000), 75)

  const initParticles = () => {
    particles = []
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const baseAlpha = Math.random() * 0.4 + 0.15
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        alpha: baseAlpha,
        baseAlpha,
      })
    }
  }
  initParticles()

  // Animation render loop
  const render = () => {
    // Smoothly interpolate mouse coordinates
    mouse.x += (mouse.targetX - mouse.x) * 0.1
    mouse.y += (mouse.targetY - mouse.y) * 0.1

    ctx.clearRect(0, 0, width, height)

    // 1. Draw smooth cursor aura glow
    const auraGradient = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      0,
      mouse.x,
      mouse.y,
      mouse.radius
    )
    auraGradient.addColorStop(0, 'rgba(255, 255, 255, 0.20)')
    auraGradient.addColorStop(0.5, 'rgba(254, 202, 202, 0.12)')
    auraGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = auraGradient
    ctx.beginPath()
    ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2)
    ctx.fill()

    // 2. Draw & update interactive particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      if (!p) continue

      // Natural gentle float movement
      p.x += p.vx
      p.y += p.vy

      // Wrap around edges
      if (p.x < 0) p.x = width
      if (p.x > width) p.x = 0
      if (p.y < 0) p.y = height
      if (p.y > height) p.y = 0

      // Calculate distance to mouse cursor for subtle interaction
      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < mouse.radius) {
        const force = (1 - dist / mouse.radius) * 1.5
        const angle = Math.atan2(dy, dx)
        p.x += Math.cos(angle) * force
        p.y += Math.sin(angle) * force
        p.alpha = Math.min(p.baseAlpha + 0.4, 0.9)
      } else {
        p.alpha += (p.baseAlpha - p.alpha) * 0.05
      }

      // Draw particle dot
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()

      // Connect nearby particles with delicate faint constellation lines
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j]
        if (!p2) continue

        const djx = p.x - p2.x
        const djy = p.y - p2.y
        const distance = Math.sqrt(djx * djx + djy * djy)

        if (distance < 85) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / 85) * 0.12})`
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      }
    }

    animationFrameId = requestAnimationFrame(render)
  }

  render()

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('mousemove', handlePointerMove)
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
  })
})

useHead({
  title: 'Bekasku — Coming Soon',
  meta: [
    {
      name: 'description',
      content: 'Bekasku Web Segera Hadir! Marketplace jual beli barang bekas dan preloved terpercaya #1 di Indonesia.'
    }
  ]
})
</script>
