<script setup lang="ts">
import { computed } from 'vue'
import { CreditCard } from 'lucide-vue-next'
import { sanitizeMediaUrl } from '~/utils/media'

const props = withDefaults(
  defineProps<{
    paymentName: string
    logoUrl?: string
    width?: number
    height?: number
  }>(),
  {
    logoUrl: '',
    width: 48,
    height: 32,
  }
)

function resolveUrl(rawUrl: string, name: string): string {
  const trimmed = (rawUrl || '').trim()

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (trimmed.includes('ShopeePay_QRI') || trimmed.includes('image-179102188943476021')) {
      return 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/payment-method%2Fimage-179102188943476021.png?alt=media'
    }
    if (trimmed.includes('bc.bekasku.id')) {
      const filename = trimmed.split('/').pop()
      return `https://api.bekasku.id/assets/images/payment-method/${filename}`
    }
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    return `https://api.bekasku.id${trimmed}`
  }

  if (trimmed.length > 0) {
    if (trimmed.includes('ShopeePay_QRI') || trimmed.includes('image-179102188943476021')) {
      return 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/payment-method%2Fimage-179102188943476021.png?alt=media'
    }
    return `https://api.bekasku.id/assets/images/payment-method/${trimmed}`
  }

  // Fallback berdasarkan nama metode
  const nameLower = (name || '').toLowerCase().trim()
  if (nameLower.includes('bca')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4fa_20231127090822_20.BCA.png'
  }
  if (nameLower.includes('bni')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4f7_20231127084254_17.%20BNI%20JPG.jpeg'
  }
  if (nameLower.includes('bri')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4f8_20231127084215_18.BRI.webp'
  }
  if (nameLower.includes('mandiri')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4f9_20231127084324_19.Mandiri.png'
  }
  if (nameLower.includes('permata')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4fd_20231127090914_5.permata.png'
  }
  if (nameLower.includes('cimb')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4fb_20231127090846_3.cimb.jpeg'
  }
  if (nameLower.includes('bsi')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4fc_20231127090902_4.bsi.png'
  }
  if (nameLower.includes('bnc')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_63d61aaabebd6aec3200e4f0_20231127090834_21.BNC.jpeg'
  }
  if (nameLower.includes('ovo')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837427fc0b2c6e11dec4ea_20231124114228_logo-ovo.png'
  }
  if (nameLower.includes('gopay') || nameLower.includes('go-pay')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_6183746afc0b2c6e11dec4ef_20231124184936_gopay-integration.png'
  }
  if (nameLower.includes('linkaja') || nameLower.includes('link aja')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_618374aafc0b2c6e11dec4f1_20231127084241_16.linkaja.png'
  }
  if (nameLower.includes('dana')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_62860ca61c958c7c79e5c6f0_20231127091151_9.dana.png'
  }
  if (nameLower.includes('qris')) {
    return 'https://firebasestorage.googleapis.com/v0/b/bekasku-e1979.appspot.com/o/payment-method%2Fimage-179102188943476021.png?alt=media'
  }
  if (nameLower.includes('shopee')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_62860ca61c958c7c79e5c6f1_20231127091206_10.shopeePay.jpeg'
  }
  if (nameLower.includes('indomaret')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837757fc0b2c6e11dec505_20231127091109_6.indomaret.png'
  }
  if (nameLower.includes('alfamart')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_6183779dfc0b2c6e11dec50a_20231127091127_7%20alfamart.png'
  }
  if (nameLower.includes('danamon')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_629475aece15ffacda469a0b_20231127091229_12.danamon.jpeg'
  }
  if (nameLower.includes('maybank')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_629475aece15ffacda469a0c_20231127091258_13.maybank.jpeg'
  }
  if (nameLower.includes('sinarmas')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_629475aece15ffacda469a0e_20231127091311_14.%20sinarmas.png'
  }
  if (nameLower.includes('akulaku')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_625cde10a67740bf61885b71_20231127091138_8%20Al.webp'
  }
  if (nameLower.includes('visa') || nameLower.includes('mastercard') || nameLower.includes('kartu kredit')) {
    return 'https://api.bekasku.id/assets/images/payment-method/payment_method_6183735cfc0b2c6e11dec4e5_20231127074826_1.visakredit.png'
  }

  return ''
}

const resolvedImageUrl = computed(() => {
  const url = resolveUrl(props.logoUrl, props.paymentName)
  return sanitizeMediaUrl(url, '')
})

const imageLoadError = ref(false)

watch(
  () => [props.logoUrl, props.paymentName],
  () => {
    imageLoadError.value = false
  }
)
</script>

<template>
  <div
    class="shrink-0 flex items-center justify-center rounded-lg overflow-hidden bg-white border border-border-light/70 p-0.5"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <img
      v-if="resolvedImageUrl && !imageLoadError"
      :src="resolvedImageUrl"
      :alt="paymentName"
      :width="width"
      :height="height"
      class="w-full h-full object-contain"
      loading="lazy"
      @error="imageLoadError = true"
    />
    <div
      v-else
      class="w-full h-full flex items-center justify-center bg-surface-2 text-text-subtle"
    >
      <CreditCard class="w-4 h-4 stroke-[1.8]" />
    </div>
  </div>
</template>

