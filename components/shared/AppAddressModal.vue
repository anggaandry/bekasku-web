<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      @click.self="close"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[88vh] my-auto transition-all transform animate-in zoom-in-95 duration-200"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-white shrink-0">
          <div class="flex items-center gap-3">
            <button
              v-if="currentView === 'form'"
              type="button"
              class="p-1.5 -ml-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              title="Kembali ke daftar alamat"
              @click="currentView = 'list'"
            >
              <ArrowLeft class="w-5 h-5" />
            </button>
            <div>
              <h3 class="text-base font-bold text-gray-900 leading-snug">
                {{ currentView === 'list' ? 'Mau kirim belanjaan kamu ke mana?' : 'Tambah Alamat Pengiriman' }}
              </h3>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ currentView === 'list' ? 'Kamu bisa pilih alamat yang tersimpan disini.' : 'Pastikan data alamat kamu lengkap dan sesuai.' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer shrink-0"
            @click="close"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Body: View 1 (List Alamat) -->
        <div v-if="currentView === 'list'" class="p-6 overflow-y-auto flex-1 space-y-4">
          <!-- Loading State -->
          <div v-if="loading" class="py-12 flex flex-col items-center justify-center gap-3">
            <div class="w-7 h-7 border-2 border-[#E31B23] border-t-transparent rounded-full animate-spin" />
            <p class="text-xs text-gray-500 font-medium">Memuat daftar alamat...</p>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="addressList.length === 0"
            class="py-8 flex flex-col items-center justify-center text-center px-4"
          >
            <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-[#E31B23] mb-3">
              <MapPinOff class="w-7 h-7" />
            </div>
            <h4 class="text-sm font-bold text-gray-900">Belum ada alamat terdaftar</h4>
            <p class="text-xs text-gray-500 mt-1 max-w-xs">
              Tambahkan alamat untuk mempermudah pengiriman belanjaan kamu di BekasKu.
            </p>
            <button
              type="button"
              class="mt-4 px-5 py-2.5 bg-[#E31B23] hover:bg-[#c9151c] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              @click="currentView = 'form'"
            >
              <Plus class="w-4 h-4" />
              <span>Tambah Alamat Sekarang</span>
            </button>
          </div>

          <!-- Address Cards Grid -->
          <div v-else class="space-y-3">
            <!-- Add Address Quick Row -->
            <div class="flex items-center justify-between pb-1">
              <span class="text-xs font-bold text-gray-700">Daftar Alamat Tersimpan</span>
              <button
                type="button"
                class="text-xs font-bold text-[#E31B23] hover:underline flex items-center gap-1 cursor-pointer"
                @click="currentView = 'form'"
              >
                <Plus class="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Tambah Alamat</span>
              </button>
            </div>

            <!-- List of Cards -->
            <div
              v-for="addr in addressList"
              :key="addr.id || addr._id"
              class="p-4 rounded-2xl border transition-all cursor-pointer relative text-left group"
              :class="
                isCurrentAddress(addr)
                  ? 'border-[#E31B23] bg-red-50/35 ring-1 ring-[#E31B23]/40'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/70'
              "
              @click="handleSelect(addr)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-gray-900">{{ addr.address_name }}</span>
                  <span
                    v-if="addr.main"
                    class="bg-[#E31B23]/10 text-[#E31B23] text-[10px] font-extrabold px-2 py-0.5 rounded-md"
                  >
                    Utama
                  </span>
                </div>
                <div v-if="isCurrentAddress(addr)" class="text-[#E31B23] shrink-0">
                  <CheckCircle2 class="w-5 h-5 fill-[#E31B23] text-white" />
                </div>
              </div>

              <div class="mt-2 text-xs text-gray-700">
                <p class="font-semibold text-gray-900">
                  {{ addr.contact_name }}
                  <span class="font-normal text-gray-500">({{ addr.contact_phone }})</span>
                </p>
                <p class="mt-1 text-gray-600 line-clamp-2 leading-relaxed">
                  {{ addr.address }}
                </p>
                <p v-if="addr.address_note" class="mt-1 text-[11px] text-gray-400 italic">
                  Catatan: {{ addr.address_note }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Body: View 2 (Form Tambah Alamat) -->
        <form v-else class="p-6 overflow-y-auto flex-1 space-y-4" @submit.prevent="handleSaveNewAddress">
          <!-- Label Alamat -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Label Alamat</label>
            <div class="flex items-center gap-2 flex-wrap">
              <button
                v-for="label in ['Rumah', 'Kantor', 'Apartemen', 'Kos']"
                :key="label"
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                :class="
                  formData.address_name === label
                    ? 'bg-[#E31B23] text-white font-bold'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                "
                @click="formData.address_name = label"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <!-- Contact Name & Phone -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Penerima *</label>
              <input
                v-model="formData.contact_name"
                type="text"
                required
                placeholder="Contoh: Erlangga"
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Nomor Telepon *</label>
              <input
                v-model="formData.contact_phone"
                type="tel"
                required
                placeholder="Contoh: 08123456789"
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
              />
            </div>
          </div>

          <!-- Kota / Wilayah -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Kota / Kabupaten *</label>
            <input
              v-model="formData.city"
              type="text"
              required
              placeholder="Contoh: Kota Medan"
              class="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
            />
          </div>

          <!-- Alamat Lengkap -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Alamat Lengkap *</label>
            <textarea
              v-model="formData.address"
              rows="3"
              required
              placeholder="Nama jalan, nomor rumah/gedung, RT/RW, kecamatan..."
              class="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] resize-none"
            />
          </div>

          <!-- Catatan / Patokan -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Catatan / Patokan (Opsional)</label>
            <input
              v-model="formData.address_note"
              type="text"
              placeholder="Contoh: Pagar hitam depan pos satpam"
              class="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
            />
          </div>

          <!-- Set as main address -->
          <label class="flex items-center gap-2 cursor-pointer pt-1">
            <input
              v-model="formData.main"
              type="checkbox"
              class="rounded text-[#E31B23] focus:ring-[#E31B23] w-4 h-4 cursor-pointer"
            />
            <span class="text-xs font-medium text-gray-700">Jadikan sebagai alamat utama</span>
          </label>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              @click="currentView = 'list'"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-[#E31B23] hover:bg-[#c9151c] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check class="w-3.5 h-3.5" />
              <span>Simpan Alamat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  X,
  Plus,
  ArrowLeft,
  MapPinOff,
  CheckCircle2,
  Check,
} from 'lucide-vue-next'
import { useAddress, type UserAddress } from '~/composables/useAddress'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', address: UserAddress): void
}>()

const { addressList, currentAddress, loading, fetchAddresses, selectAddress, addAddress } = useAddress()

const currentView = ref<'list' | 'form'>('list')

const formData = reactive({
  address_name: 'Rumah',
  contact_name: '',
  contact_phone: '',
  city: '',
  address: '',
  address_note: '',
  main: false,
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      currentView.value = 'list'
      fetchAddresses()
    }
  },
  { immediate: true }
)

function close() {
  emit('update:modelValue', false)
}

function isCurrentAddress(addr: UserAddress) {
  if (currentAddress.value) {
    if (currentAddress.value.id && addr.id) {
      return currentAddress.value.id === addr.id
    }
    return currentAddress.value.address === addr.address
  }
  return addr.main === true || addr.main === 1
}

function handleSelect(addr: UserAddress) {
  selectAddress(addr)
  emit('select', addr)
  close()
}

async function handleSaveNewAddress() {
  if (!formData.contact_name || !formData.contact_phone || !formData.address) return

  const newAddr = await addAddress({
    address_name: formData.address_name || 'Rumah',
    contact_name: formData.contact_name,
    contact_phone: formData.contact_phone,
    city: formData.city,
    address: formData.address,
    address_note: formData.address_note,
    main: formData.main,
  })

  emit('select', newAddr)
  close()
}
</script>
