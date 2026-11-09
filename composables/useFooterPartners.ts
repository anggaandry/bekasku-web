import { computed, ref } from 'vue'
import {
  BEKASKU_CENTER_DEFAULT_WORKING_HOUR,
  BEKASKU_CENTER_SUPPORT_EMAIL,
  COMPANY_OFFICIAL_PHONE,
} from '~/utils/constants'
import { defaultHelpContact } from '~/composables/useHelpCenter'
import {
  formatPhoneDisplay,
  formatPhoneHref,
  formatSocialItems,
  useLegalPolicy,
} from '~/composables/useLegalPolicy'
import type { HelpSocmedItem } from '~/types/help'

export interface PartnerItem {
  id?: string
  name: string
  code?: string
  image: string
  category?: 'bank' | 'ewallet' | 'retail' | 'courier'
}

export function useFooterPartners() {
  const { fetchCompanyInfo } = useLegalPolicy()

  const phone = ref(COMPANY_OFFICIAL_PHONE)
  const email = ref(BEKASKU_CENTER_SUPPORT_EMAIL)
  const workingHour = ref(BEKASKU_CENTER_DEFAULT_WORKING_HOUR)
  const socmed = ref<HelpSocmedItem[]>(defaultHelpContact().socmed)

  const formattedPhone = computed(() => formatPhoneDisplay(phone.value))
  const telHref = computed(() => formatPhoneHref(phone.value))
  const socialItems = computed(() => formatSocialItems(socmed.value))

  async function loadFooterContact() {
    try {
      const info = await fetchCompanyInfo()
      if (info.phone) phone.value = info.phone
      if (info.email) email.value = info.email
      if (info.working_hour) workingHour.value = info.working_hour
      if (info.socmed && info.socmed.length > 0) socmed.value = info.socmed
    } catch {
      // keep default official contact info
    }
  }
  // Official Payment Partners from production API https://api.bekasku.id/assets/images/payment-method/
  const paymentMethods: PartnerItem[] = [
    {
      name: 'BCA',
      code: 'bca',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4fa_20231127090822_20.BCA.png',
      category: 'bank',
    },
    {
      name: 'Mandiri',
      code: 'mandiri',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4f9_20231127084324_19.Mandiri.png',
      category: 'bank',
    },
    {
      name: 'BNI',
      code: 'bni',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4f7_20231127084254_17.%20BNI%20JPG.jpeg',
      category: 'bank',
    },
    {
      name: 'BRI',
      code: 'bri',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4f8_20231127084215_18.BRI.webp',
      category: 'bank',
    },
    {
      name: 'BSI',
      code: 'bsi',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4fc_20231127090902_4.bsi.png',
      category: 'bank',
    },
    {
      name: 'Permata Bank',
      code: 'permata',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4fd_20231127090914_5.permata.png',
      category: 'bank',
    },
    {
      name: 'CIMB Niaga',
      code: 'cimb',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837716fc0b2c6e11dec4fb_20231127090846_3.cimb.jpeg',
      category: 'bank',
    },
    {
      name: 'GoPay',
      code: 'gopay',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_6183746afc0b2c6e11dec4ef_20231124184936_gopay-integration.png',
      category: 'ewallet',
    },
    {
      name: 'ShopeePay',
      code: 'shopeepay',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_62860ca61c958c7c79e5c6f1_20231127091206_10.shopeePay.jpeg',
      category: 'ewallet',
    },
    {
      name: 'DANA',
      code: 'dana',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_62860ca61c958c7c79e5c6f0_20231127091151_9.dana.png',
      category: 'ewallet',
    },
    {
      name: 'OVO',
      code: 'ovo',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837427fc0b2c6e11dec4ea_20231124114228_logo-ovo.png',
      category: 'ewallet',
    },
    {
      name: 'LinkAja',
      code: 'linkaja',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_618374aafc0b2c6e11dec4f1_20231127084241_16.linkaja.png',
      category: 'ewallet',
    },
    {
      name: 'Indomaret',
      code: 'indomaret',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_61837757fc0b2c6e11dec505_20231127091109_6.indomaret.png',
      category: 'retail',
    },
    {
      name: 'Alfamart',
      code: 'alfamart',
      image: 'https://api.bekasku.id/assets/images/payment-method/payment_method_6183779dfc0b2c6e11dec50a_20231127091127_7%20alfamart.png',
      category: 'retail',
    },
  ]

  // Official Shipping Couriers from bekasku_v3 local assets
  const couriers: PartnerItem[] = [
    {
      name: 'JNE Express',
      code: 'jne',
      image: '/images/couriers/jne.png',
      category: 'courier',
    },
    {
      name: 'J&T Express',
      code: 'jnt',
      image: '/images/couriers/jnt.png',
      category: 'courier',
    },
    {
      name: 'SiCepat',
      code: 'sicepat',
      image: '/images/couriers/sicepat.png',
      category: 'courier',
    },
    {
      name: 'Lion Parcel',
      code: 'lion',
      image: '/images/couriers/lion.png',
      category: 'courier',
    },
    {
      name: 'Paxel',
      code: 'paxel',
      image: '/images/couriers/paxel.png',
      category: 'courier',
    },
    {
      name: 'Deliveree',
      code: 'deliveree',
      image: '/images/couriers/deliveree.png',
      category: 'courier',
    },
    {
      name: 'Lalamove',
      code: 'lalamove',
      image: '/images/couriers/lalamove.png',
      category: 'courier',
    },
    {
      name: 'Indah Logistik',
      code: 'indah',
      image: '/images/couriers/indah.png',
      category: 'courier',
    },
    {
      name: 'IDexpress',
      code: 'ide',
      image: '/images/couriers/ide.png',
      category: 'courier',
    },
    {
      name: 'Anteraja',
      code: 'anteraja',
      image: '/images/couriers/anteraja.png',
      category: 'courier',
    },
    {
      name: 'Gojek',
      code: 'gojek',
      image: '/images/couriers/gojek.png',
      category: 'courier',
    },
    {
      name: 'GrabExpress',
      code: 'grab',
      image: '/images/couriers/grab.png',
      category: 'courier',
    },
  ]

  return {
    paymentMethods,
    couriers,
    phone,
    email,
    workingHour,
    formattedPhone,
    telHref,
    socialItems,
    loadFooterContact,
  }
}
