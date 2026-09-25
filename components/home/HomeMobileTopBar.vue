<template>
  <div class="md:hidden w-full bg-white border-b border-gray-100 pb-2">
    <!-- 1. Live Circle Story Avatars (Matching mobile_v3 screenshot home_red.png) -->
    <div class="flex items-center gap-3 overflow-x-auto scrollbar-none px-3 pt-3 pb-2 select-none">
      <div
        v-for="item in liveStories"
        :key="item.id"
        class="flex flex-col items-center shrink-0 cursor-pointer group"
        @click="navigateTo(item.link || '/#kategori-live')"
      >
        <!-- Circle Avatar with Gradient Live Ring -->
        <div class="relative p-0.5 rounded-full bg-gradient-to-tr from-[#E31B23] via-[#EBAD25] to-[#E31B23]">
          <div class="w-14 h-14 rounded-full overflow-hidden bg-white p-0.5">
            <img
              :src="item.avatar"
              :alt="item.name"
              class="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
            />
          </div>
          <!-- Red LIVE Pill Badge at the bottom of the circle -->
          <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#E31B23] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-wider shadow-xs uppercase leading-none">
            LIVE
          </span>
        </div>

        <!-- Name Label -->
        <span class="text-[11px] font-medium text-gray-800 mt-2 max-w-[62px] truncate text-center leading-tight">
          {{ item.name }}
        </span>
      </div>
    </div>

    <!-- 2. Dual Action Chips: Voucher & Address (Matching mobile_v3 screenshot home_red.png) -->
    <div class="flex items-center gap-2 px-3 pt-1">
      <!-- Left Chip: Voucher -->
      <button
        type="button"
        class="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 px-2.5 py-1.5 rounded-full text-xs font-semibold text-gray-700 shrink-0 shadow-2xs cursor-pointer active:scale-95 transition-all"
        @click="navigateTo('/terms')"
      >
        <Ticket class="w-3.5 h-3.5 text-[#E31B23]" />
        <span>Voucher</span>
      </button>

      <!-- Right Chip: Location Address -->
      <button
        type="button"
        class="flex-1 flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 px-2.5 py-1.5 rounded-full text-xs font-semibold text-gray-700 min-w-0 shadow-2xs cursor-pointer active:scale-95 transition-all text-left"
        @click="openAddressModal"
      >
        <MapPin class="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
        <span class="truncate text-gray-800 font-medium">
          {{ currentAddressText }}
        </span>
      </button>
    </div>

    <!-- Address Modal Integration -->
    <AppAddressModal v-model="isModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { Ticket, MapPin } from 'lucide-vue-next'
import { useAddress } from '~/composables/useAddress'

const { currentAddressText } = useAddress()
const isModalOpen = ref(false)

function openAddressModal() {
  isModalOpen.value = true
}

const liveStories = ref([
  {
    id: 1,
    name: 'anne14',
    avatar: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/avatar/image-175967555011556755.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=SKwSRww%2FSHAvMLKYNSliiTK3lIqLXxtYqPNlszXVX%2FJeB9c%2FLjkCNu%2F%2FjxYs9VRqtZgy4BI2EpZuUAmVDbcXbqDD%2By%2B1hUAuJxAksI3%2BGKURLd0VYkusF2E9pet6V3yWloRHXydbv7ERLgR4BgThQsYzj2wUhXDx0QDv3e7llM3WBOwftNKQAboRzzBl7RSsE5vrhlubd26ekNzWT8bX81IX8EGFFk%2BMBMBbkjyTYX1VIgDwmy4JU%2Bc2q3830MXz3XU9JpI80sxQnDzilkq%2F1lsGNEBnXJi2c3tk%2BvG6rtxf9t9W4wUTLMjIKtkKKyMorYxO3NIgrJH309OL%2F5nOSQ%3D%3D',
    link: '/#kategori-live',
  },
  {
    id: 2,
    name: 'TokoPreloved',
    avatar: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/avatar/image-176569757984546781.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=pIkRPtoCmopbdjXCFYKGYZBUB9umsxLpUx3Ba2s7Mx%2FiV0KGbxFvRI%2FOu7Z2PaKECD1m4EeYJNp6u2HamK%2BwGr38EkGCTj0jt67YW9BqnbWgE5i%2FffSEoifwIJtUySOZGUqVzfZVZnaShl7VA0PjFNsjSVjzLO%2FOUQsVrfwPgX%2B8UxQaMHMKa3nHWHyoqZsM9sLBODusA8PhPwJRrzx7ZAPVA%2BpBI6TG6nvsj5jFx1P0%2BqabmqNVlMW2xXsbue1%2BZv605%2FYGAuF9GNnxyiSwqBgqjdl0ypIfp2j2F7yJCQ0o%2FuY7x9LJqHdk7r1l%2FJOsf10pxY1tfgaMMdck%2BGnOMA%3D%3D',
    link: '/#kategori-live',
  },
  {
    id: 3,
    name: 'JualCepat',
    avatar: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/avatar/image-17822561701104639.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=kVsl2ggvL0utg0V52VoZ8xNoa7GCB%2B4bkqMszuHFcP1atP%2BkCV9dadqD4EKebmaIz1Ya9RogM2IrufS5n67ccpBaQYq5U7GuIccsuLXwUww5i62otFkxpuymE7IJZwzJoJlUIvKaOhlaLKRLn5xH09CtwKhfxt3CzfXtYfwNmilH33ocd2gKbk2i0EI73TUKFW2swZ0dmM15eL4ZXNa3InhUqC%2F5YsmAuF987R%2FSCcDDWIYkRTlhfUsm97SHMNoFq2LjW3Dil3ZK%2B5z%2F1P7I1aMJYq%2B4TaOmma1hBBml%2BmxTYzUNxv2q2R0PBIC07wcBrPwuBHsM9VvDujT75SI6Sw%3D%3D',
    link: '/#kategori-live',
  },
  {
    id: 4,
    name: 'AllInMix',
    avatar: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/avatar/image-176588689418361166.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=njypR4QQqqumsVqt2KUV05xp86eWS0fRKAZH%2BYTD5h86Y2TYvOCTgR%2FNZFEtiK1JPJyQMWTd7AuUrHOh%2B2wFO%2BYeKWroJhnWuUK%2B0fVb6AJV0s6zlmPfSK8ctKhbZL%2B5nBd%2FG%2B2r1w%2BzI2%2B%2BP%2BMGCuHIF5r%2BtJUEEREw%2B7ob8P%2BvXAiC9cDB6SVioeg%2B7OXyd%2F%2FQOnZyiUnoFLZQlRlUdQrXyZrb2TvCBRGybfOQh6SpNckarbR4FsHljjh3RBYWvME2KmcvW3WfMLB2yOG5dkfFvVgtFtKN%2FouH7Af9ESoHP98YUzmYf1bJBhXSeX%2F7D1svAyj8LdR1C0VgD%2FhsEQ%3D%3D',
    link: '/#kategori-live',
  },
  {
    id: 5,
    name: 'LeoPreloved',
    avatar: 'https://storage.googleapis.com/bekasku-e1979.appspot.com/avatar/image-177063202004391142.png?GoogleAccessId=firebase-adminsdk-vnqq1%40bekasku-e1979.iam.gserviceaccount.com&Expires=16446992400&Signature=B4VSWQMvotI63xnGVMUJMeVHMgI53ZyrZh3BWOjZOXJFCl%2FTFyt3qhrCvGru%2BLpuJU9Xqp4MSMMP9pNJBcK%2BCVrknTegjwtuGK1S%2Bl%2Fx%2FMfDp7Se5JvQnQQl%2FO8UA9XEyrfIqLQUDZgdBQY29O6aqqEalEO0cgcZh4E0inaCH41be5ZNtvJhsv%2B7AY9lI2VGpUxoN2NpnM9mpDHDB7%2BOQRQlBp8TJJhi0pUxUGgEWQmu9dibtK6AQ2c5m8mixIfDt55VJgk858fbrBHyzVNgcNkfDG6ZPS5mcSqALoXtQMQEN4ofDmiIuDE5lUZvOju3rjIq4k%2F4tDI9H6FOso5PZA%3D%3D',
    link: '/#bestdeal-creator',
  },
])
</script>
