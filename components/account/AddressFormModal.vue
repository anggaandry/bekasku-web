<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs font-outfit overscroll-contain"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="isEdit ? 'edit-address-title' : 'new-address-title'"
        @click.self="handleClose"
      >
        <div
          class="w-full sm:max-w-4xl lg:max-w-5xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <!-- Header -->
          <div class="px-5 sm:px-7 py-4 border-b border-border flex items-center justify-between shrink-0 bg-white">
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="sm:hidden p-1.5 -ml-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
                aria-label="Kembali"
                @click="handleClose"
              >
                <ArrowLeft class="w-5 h-5" aria-hidden="true" />
              </button>
              <h2
                :id="isEdit ? 'edit-address-title' : 'new-address-title'"
                class="text-base sm:text-lg font-bold text-text"
              >
                {{ isEdit ? 'Ubah Alamat' : 'Detail Alamat' }}
              </h2>
            </div>

            <button
              type="button"
              class="hidden sm:flex p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Tutup modal"
              @click="handleClose"
            >
              <X class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <!-- Loading state when fetching initial data -->
          <div v-if="isLoadingDetail" class="p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 class="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
            <p class="text-xs text-text-muted">Memuat data alamat...</p>
          </div>

          <!-- Content: 2-Column Responsive Grid (Kiri & Kanan di Desktop) -->
          <div
            v-else
            class="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <!-- KOLOM KIRI: Map Card with IFRAME + Alamat Lengkap + Catatan Kurir -->
              <div class="space-y-4">
                <!-- Map Card matching Detail Alamat.png -->
                <div class="p-4 rounded-2xl border border-border bg-white shadow-2xs space-y-3">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-start gap-2.5 min-w-0">
                      <MapPin class="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <div class="min-w-0">
                        <p class="text-sm font-bold text-text truncate">
                          {{ form.address || form.city || 'Pilih Titik Lokasi' }}
                        </p>
                        <p class="text-xs text-text-muted line-clamp-1 mt-0.5">
                          {{ [form.subdistrict, form.city, form.province].filter(Boolean).join(', ') || 'Kecamatan, Kota, Provinsi' }}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      class="text-xs font-bold text-primary hover:underline cursor-pointer shrink-0"
                      @click="showMapModal = true"
                    >
                      Ubah
                    </button>
                  </div>

                  <!-- Real Map Iframe with marker at exact chosen coordinates -->
                  <div
                    class="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden border border-border bg-surface-2 cursor-pointer group"
                    @click="showMapModal = true"
                  >
                    <iframe
                      v-if="hasCoordinates"
                      :key="`${form.lat}-${form.lon}`"
                      :src="`https://www.openstreetmap.org/export/embed.html?bbox=${Number(form.lon) - 0.005}%2C${Number(form.lat) - 0.003}%2C${Number(form.lon) + 0.005}%2C${Number(form.lat) + 0.003}&layer=mapnik&marker=${Number(form.lat)}%2C${Number(form.lon)}`"
                      class="w-full h-full border-0 pointer-events-none"
                      loading="lazy"
                      title="Peta Titik Lokasi"
                    />
                    <div
                      v-else
                      class="w-full h-full flex flex-col items-center justify-center text-center p-4 text-text-muted space-y-1.5"
                    >
                      <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <MapPin class="w-5 h-5" aria-hidden="true" />
                      </div>
                      <p class="text-xs font-semibold text-text">Belum ada titik peta dipilih</p>
                      <p class="text-[11px] text-text-muted">Klik untuk memilih titik akurat di peta</p>
                    </div>

                    <!-- Floating Hover Badge -->
                    <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span class="px-3 py-1.5 rounded-lg bg-white/95 text-xs font-bold text-text shadow-sm">
                        Ubah Titik di Peta
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Alamat Lengkap Textarea -->
                <div>
                  <label for="address-detail-input" class="block text-xs font-bold text-text mb-1.5">
                    Alamat Lengkap <span class="text-primary">*</span>
                  </label>
                  <textarea
                    id="address-detail-input"
                    v-model="form.address"
                    rows="3"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm text-text placeholder:text-text-muted transition-colors resize-none bg-white"
                    placeholder="Nama jalan, nomor rumah/gedung, RT/RW, kelurahan"
                  />
                  <p class="text-[11px] text-text-muted mt-1">
                    Lengkapi alamat sesuai dengan titik lokasi
                  </p>
                </div>

                <!-- Catatan untuk Kurir (Optional) -->
                <div>
                  <label for="address-note-input" class="block text-xs font-bold text-text mb-1.5">
                    Catatan untuk Kurir <span class="text-text-muted font-normal">(Optional)</span>
                  </label>
                  <input
                    id="address-note-input"
                    v-model="form.address_note"
                    type="text"
                    class="w-full h-11 px-3.5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm text-text placeholder:text-text-muted transition-colors bg-white"
                    placeholder="Contoh: Warna rumah, nomor unit, patokan, dll."
                  >
                  <p class="text-[11px] text-text-muted mt-1">
                    Contoh: Warna rumah, nomor unit, patokan, dll.
                  </p>
                </div>
              </div>

              <!-- KOLOM KANAN: Label + Nama + No Telp + Checkbox -->
              <div class="space-y-4">
                <!-- Label Alamat -->
                <div>
                  <label for="address-label-input" class="block text-xs font-bold text-text mb-1.5">
                    Label Alamat
                  </label>
                  <!-- Quick chips (Rumah, Kantor, Apartemen, Kos) -->
                  <div class="flex flex-wrap items-center gap-2 mb-2">
                    <button
                      v-for="chip in labelChips"
                      :key="chip"
                      type="button"
                      class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
                      :class="form.address_name === chip
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text hover:bg-surface-2'"
                      @click="form.address_name = chip"
                    >
                      {{ chip }}
                    </button>
                  </div>
                  <!-- Label input matching Detail Alamat.png -->
                  <input
                    id="address-label-input"
                    v-model="form.address_name"
                    type="text"
                    class="w-full h-11 px-3.5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm text-text placeholder:text-text-muted transition-colors bg-white"
                    placeholder="Contoh: Rumah, Kantor, dll"
                  >
                  <p class="text-[11px] text-text-muted mt-1">
                    Contoh: Rumah, Kantor, dll
                  </p>
                </div>

                <!-- Nama Penerima with User Icon -->
                <div>
                  <label for="recipient-name-input" class="block text-xs font-bold text-text mb-1.5">
                    Nama Penerima <span class="text-primary">*</span>
                  </label>
                  <div class="relative">
                    <input
                      id="recipient-name-input"
                      v-model="form.contact_name"
                      type="text"
                      class="w-full h-11 pl-3.5 pr-10 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm text-text placeholder:text-text-muted transition-colors bg-white"
                      placeholder="Masukkan nama penerima"
                    >
                    <User class="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  </div>
                </div>

                <!-- Nomor Telepon -->
                <div>
                  <label for="recipient-phone-input" class="block text-xs font-bold text-text mb-1.5">
                    Nomor Telepon <span class="text-primary">*</span>
                  </label>
                  <div class="relative">
                    <input
                      id="recipient-phone-input"
                      v-model="form.contact_phone"
                      type="tel"
                      class="w-full h-11 pl-3.5 pr-10 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm text-text placeholder:text-text-muted transition-colors bg-white"
                      placeholder="Masukkan nomor telepon"
                    >
                    <Phone class="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  </div>
                </div>

                <!-- Checkbox Alamat Utama -->
                <div class="pt-1">
                  <label class="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      v-model="form.main"
                      type="checkbox"
                      class="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                    >
                    <span class="text-xs font-semibold text-text">
                      Jadikan sebagai alamat utama
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Fixed Footer Action Bar -->
          <div
            v-if="!isLoadingDetail"
            class="px-5 sm:px-7 py-3.5 border-t border-border bg-white sm:bg-surface-2/40 flex items-center justify-between gap-3 shrink-0"
          >
            <div class="flex items-center gap-2">
              <button
                v-if="isEdit"
                type="button"
                :disabled="isSubmitting"
                class="h-11 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                @click="showDeleteModal = true"
              >
                <Trash2 class="w-4 h-4" aria-hidden="true" />
                <span>Hapus Alamat</span>
              </button>
              <button
                v-else
                type="button"
                class="h-11 px-5 rounded-xl border border-border text-text font-semibold text-xs sm:text-sm hover:bg-surface-2 transition-colors cursor-pointer"
                @click="handleClose"
              >
                Batal
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="isEdit"
                type="button"
                class="hidden sm:inline-flex h-11 px-5 rounded-xl border border-border text-text font-semibold text-xs sm:text-sm hover:bg-surface-2 transition-colors cursor-pointer"
                @click="handleClose"
              >
                Batal
              </button>
              <button
                type="button"
                :disabled="isSubmitting || !isFormValid"
                class="flex-1 sm:flex-none h-11 px-7 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                @click="showConfirmModal = true"
              >
                <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Simpan Alamat</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal Map Picker -->
    <AddressMapPickerModal
      v-model="showMapModal"
      :initial-lat="Number(form.lat) || undefined"
      :initial-lng="Number(form.lon) || undefined"
      @select="handleSelectMapLocation"
    />

    <!-- Modal Konfirmasi Simpan (Bottom Sheet Style) -->
    <AddressSaveConfirmModal
      v-model="showConfirmModal"
      :is-loading="isSubmitting"
      @confirm="executeSave"
    />

    <!-- Modal Konfirmasi Hapus Alamat -->
    <AppModal
      v-model="showDeleteModal"
      title="Hapus Alamat"
      z-index="z-[95]"
    >
      <div class="space-y-4 font-outfit">
        <p class="text-sm sm:text-base text-text leading-relaxed">
          Apakah kamu yakin ingin menghapus alamat ini dari daftar alamat pengiriman kamu?
        </p>
        <div class="flex items-center gap-3 pt-2">
          <button
            type="button"
            class="flex-1 h-11 px-4 rounded-xl border border-border text-xs sm:text-sm text-text font-semibold hover:bg-surface-2 transition-colors cursor-pointer"
            :disabled="isSubmitting"
            @click="showDeleteModal = false"
          >
            Batal
          </button>
          <button
            type="button"
            class="flex-1 h-11 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            :disabled="isSubmitting"
            @click="executeDelete"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Ya, Hapus</span>
          </button>
        </div>
      </div>
    </AppModal>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import {
  X,
  ArrowLeft,
  MapPin,
  Loader2,
  User,
  Phone,
  Trash2,
} from 'lucide-vue-next'
import type { UserAddress, AddressFormPayload, MapLocationPoint } from '~/types/address'
import { useAddress } from '~/composables/useAddress'
import { useNotification } from '~/composables/useNotification'
import { useLocationStore } from '~/stores/location'
import AddressMapPickerModal from '~/components/account/AddressMapPickerModal.vue'
import AddressSaveConfirmModal from '~/components/account/AddressSaveConfirmModal.vue'
import AppModal from '~/components/shared/AppModal.vue'

const props = defineProps<{
  modelValue: boolean
  addressId?: string | number | null
  initialData?: UserAddress | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', address?: UserAddress): void
  (e: 'deleted', addressId: string | number): void
}>()

const { getAddressDetail, saveAddress, deleteAddress } = useAddress()
const { showNotification } = useNotification()
const locationStore = useLocationStore()

const labelChips = ['Rumah', 'Kantor', 'Apartemen', 'Kos']

const isEdit = computed(() => Boolean(props.addressId))
const isLoadingDetail = ref(false)
const isSubmitting = ref(false)

const showMapModal = ref(false)
const showConfirmModal = ref(false)
const showDeleteModal = ref(false)

const form = ref<AddressFormPayload>({
  address_id: '',
  address_name: 'Rumah',
  address: '',
  address_note: '',
  city: '',
  province: '',
  postal: '',
  subdistrict: '',
  type_city: 'Kota',
  main: false,
  lon: 0,
  lat: 0,
  contact_name: '',
  contact_phone: '',
})

const isFormValid = computed(() => {
  return (
    form.value.address?.trim() &&
    form.value.contact_name?.trim() &&
    form.value.contact_phone?.trim()
  )
})

const hasCoordinates = computed(() => {
  return Boolean(
    form.value.lat &&
    form.value.lon &&
    Number(form.value.lat) !== 0 &&
    Number(form.value.lon) !== 0
  )
})

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (import.meta.client) {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
    if (isOpen) {
      if (props.addressId) {
        await loadDetail(props.addressId)
      } else if (props.initialData) {
        populateForm(props.initialData)
      } else {
        resetForm()
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

function resetForm() {
  const defaultLat = locationStore.lat || 3.5896654
  const defaultLon = locationStore.lon || 98.6738261
  form.value = {
    address_id: '',
    address_name: 'Rumah',
    address: '',
    address_note: '',
    city: locationStore.city || 'Medan',
    province: locationStore.province || 'Sumatera Utara',
    postal: '',
    subdistrict: '',
    type_city: 'Kota',
    main: false,
    lon: defaultLon,
    lat: defaultLat,
    contact_name: '',
    contact_phone: '',
  }
}

function populateForm(data: UserAddress) {
  const defaultLat = locationStore.lat || 3.5896654
  const defaultLon = locationStore.lon || 98.6738261
  const parsedLat = Number(data.lat)
  const parsedLon = Number(data.lon)

  form.value = {
    address_id: data.id || data._id || data.address_id || '',
    address_name: data.address_name || data.name || 'Rumah',
    address: data.address || '',
    address_note: data.address_note || '',
    city: data.city || '',
    province: data.province || '',
    postal: data.postal_code || data.postal || '',
    subdistrict: data.subdistrict || '',
    type_city: data.type_city || 'Kota',
    main: Boolean(data.main === 1 || data.main === true || data.is_default === true),
    lon: parsedLon && !isNaN(parsedLon) ? parsedLon : defaultLon,
    lat: parsedLat && !isNaN(parsedLat) ? parsedLat : defaultLat,
    contact_name: data.contact_name || data.name || '',
    contact_phone: data.contact_phone || data.phone || '',
  }
}

async function loadDetail(id: string | number) {
  isLoadingDetail.value = true
  try {
    const data = await getAddressDetail(id)
    if (data) {
      populateForm(data)
    }
  } catch (err: unknown) {
    const errObj = err as { message?: string }
    showNotification({
      type: 'error',
      message: errObj?.message || 'Gagal memuat detail alamat',
    })
  } finally {
    isLoadingDetail.value = false
  }
}

function handleSelectMapLocation(point: MapLocationPoint) {
  form.value.lat = point.lat
  form.value.lon = point.lng

  if (point.city) form.value.city = point.city
  if (point.province) form.value.province = point.province
  if (point.postal) form.value.postal = point.postal
  if (point.subdistrict) form.value.subdistrict = point.subdistrict
  if (point.type_city) form.value.type_city = point.type_city

  if (!form.value.address || form.value.address.trim().length === 0) {
    form.value.address = point.subtitle ? `${point.title}, ${point.subtitle}` : point.title
  }
}

async function executeSave() {
  isSubmitting.value = true
  try {
    const res = await saveAddress(form.value)
    if (res.success) {
      showConfirmModal.value = false
      emit('saved', res.result)
      emit('update:modelValue', false)
    } else {
      showConfirmModal.value = false
      showNotification({
        type: 'error',
        message: res.message || 'Gagal menyimpan alamat',
      })
    }
  } catch (err: unknown) {
    const errObj = err as { message?: string }
    showNotification({
      type: 'error',
      message: errObj?.message || 'Gagal menyimpan alamat',
    })
  } finally {
    isSubmitting.value = false
  }
}

async function executeDelete() {
  if (!props.addressId) return
  isSubmitting.value = true
  try {
    const res = await deleteAddress(props.addressId)
    if (res.success) {
      showDeleteModal.value = false
      emit('deleted', props.addressId)
      emit('update:modelValue', false)
    } else {
      showDeleteModal.value = false
      showNotification({
        type: 'error',
        message: res.message || 'Gagal menghapus alamat',
      })
    }
  } catch (err: unknown) {
    const errObj = err as { message?: string }
    showNotification({
      type: 'error',
      message: errObj?.message || 'Gagal menghapus alamat',
    })
  } finally {
    isSubmitting.value = false
  }
}

function handleClose() {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
  emit('update:modelValue', false)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

