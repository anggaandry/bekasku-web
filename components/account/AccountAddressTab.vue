<template>
  <div class="space-y-4 font-outfit">
    <!-- GUEST LOCK: Jika belum login, tampilkan prompt dan kunci akses -->
    <div
      v-if="!authStore.isLoggedIn"
      class="bg-white rounded-2xl p-6 sm:p-10 border border-border shadow-2xs text-center"
    >
      <AppGuestPromptCard
        feature-title="Daftar Alamat"
        message="Silakan masuk atau daftar akun BekasKu untuk melihat dan mengelola daftar alamat pengiriman Anda."
        action-label="Masuk / Daftar Sekarang"
        @action="handleOpenLoginModal"
      />
    </div>

    <!-- Main Card Container (Jika sudah login) -->
    <div
      v-else
      class="bg-white rounded-2xl p-5 sm:p-7 border border-border shadow-2xs space-y-4"
    >
      <!-- Header: Title sejajar dengan Tambah Alamat (Desktop & Mobile) -->
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="font-bold text-base sm:text-lg text-text">Daftar Alamat</h3>
          <p class="text-xs text-text-muted mt-0.5">
            Pilih atau kelola alamat untuk pengiriman dan pengambilan barang.
          </p>
        </div>

        <button
          type="button"
          class="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs active:scale-95"
          @click="openAddModal"
        >
          <Plus class="w-4 h-4" aria-hidden="true" />
          <span>Tambah Alamat</span>
        </button>
      </div>

      <!-- Search Input (Daftar Alamat.png) -->
      <div v-if="addressList.length > 0" class="relative">
        <Search class="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari alamat..."
          class="w-full h-11 pl-10 pr-9 rounded-xl border border-border bg-white focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm text-text placeholder:text-text-muted transition-colors"
        >
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer p-1"
          aria-label="Hapus pencarian"
          @click="searchQuery = ''"
        >
          <X class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <!-- Addresses List: Flat rows with divider matching Daftar Alamat.png -->
      <div v-if="filteredAddresses.length > 0" class="divide-y divide-border pt-1">
        <div
          v-for="addr in filteredAddresses"
          :key="getAddressId(addr)"
          class="py-4 first:pt-2 last:pb-4 flex items-start gap-3.5 cursor-pointer group"
          @click="handleSelectAddress(addr)"
        >
          <!-- Custom Radio Indicator (Red dot inside red ring when selected) -->
          <div class="pt-0.5 shrink-0">
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
              :class="selectedAddressId === getAddressId(addr)
                ? 'border-primary bg-white'
                : 'border-border-light bg-white group-hover:border-text-muted'"
            >
              <div
                v-if="selectedAddressId === getAddressId(addr)"
                class="w-2.5 h-2.5 rounded-full bg-primary"
              />
            </div>
          </div>

          <!-- Address Info -->
          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-bold text-sm text-text">
                {{ addr.contact_name || addr.name || addr.address_name }}
              </span>
              <!-- Gray pill badge for Utama matching design -->
              <span
                v-if="isDefaultAddress(addr)"
                class="px-2 py-0.5 rounded bg-surface-2 text-text-muted text-[11px] font-medium"
              >
                Utama
              </span>
            </div>

            <p class="text-xs text-text-muted leading-relaxed">
              {{ addr.address }}
              <span v-if="addr.city || addr.province">
                , {{ [addr.subdistrict, addr.city, addr.province].filter(Boolean).join(', ') }}
              </span>
            </p>

            <p v-if="addr.contact_phone || addr.phone" class="text-xs text-text-muted">
              {{ addr.contact_phone || addr.phone }}
            </p>
          </div>

          <!-- Ubah Button: Red bold link on right -->
          <button
            type="button"
            class="text-xs font-bold text-primary hover:underline cursor-pointer shrink-0 py-0.5 px-1.5 transition-colors"
            @click.stop="openEditModal(addr)"
          >
            Ubah
          </button>
        </div>
      </div>

      <!-- No Search Results -->
      <div
        v-else-if="searchQuery && addressList.length > 0"
        class="py-8 text-center text-text-muted text-xs space-y-2"
      >
        <p>Alamat tidak ditemukan untuk kata kunci "{{ searchQuery }}"</p>
        <button
          type="button"
          class="text-xs font-semibold text-primary hover:underline cursor-pointer"
          @click="searchQuery = ''"
        >
          Reset pencarian
        </button>
      </div>

      <!-- Empty State (Daftar Alamat - Empty State.png) -->
      <div
        v-else-if="addressList.length === 0 && !loading"
        class="py-12 sm:py-16 text-center space-y-4 max-w-sm mx-auto"
      >
        <div class="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
          <MapPin class="w-10 h-10" aria-hidden="true" />
        </div>
        <div class="space-y-1.5">
          <h4 class="text-base font-bold text-text">
            Belum ada alamat nih
          </h4>
          <p class="text-xs text-text-muted leading-relaxed">
            Yuk, tambahkan alamat pengiriman kamu sekarang agar memudahkan proses pengiriman pesananmu.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex px-6 h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs transition-colors items-center gap-2 cursor-pointer"
          @click="openAddModal"
        >
          <Plus class="w-4 h-4" aria-hidden="true" />
          <span>Tambah alamat</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="py-12 text-center text-text-muted text-xs space-y-2">
        <Loader2 class="w-8 h-8 text-primary animate-spin mx-auto" aria-hidden="true" />
        <p>Memuat daftar alamat...</p>
      </div>

      <!-- Bottom Action: Full-width Red CTA "Pilih sebagai alamat utama" (Daftar Alamat.png) -->
      <div
        v-if="addressList.length > 0"
        class="pt-5"
      >
        <button
          type="button"
          class="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isSettingDefault || !canSetAsDefault"
          @click="handleSetDefault"
        >
          <Loader2 v-if="isSettingDefault" class="w-4 h-4 animate-spin" aria-hidden="true" />
          <span>Pilih sebagai alamat utama</span>
        </button>
      </div>
    </div>

    <!-- Modal Form Tambah / Ubah Alamat (Desktop Kiri-Kanan) -->
    <AddressFormModal
      v-model="showFormModal"
      :address-id="editingAddressId"
      :initial-data="editingAddressData"
      @saved="handleAddressSaved"
      @deleted="handleAddressDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, MapPin, Search, X, Loader2 } from 'lucide-vue-next'
import type { UserAddress } from '~/types/address'
import { useAddress } from '~/composables/useAddress'
import { useAuthStore } from '~/stores/auth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useNotification } from '~/composables/useNotification'
import AddressFormModal from '~/components/account/AddressFormModal.vue'
import AppGuestPromptCard from '~/components/shared/AppGuestPromptCard.vue'

const props = defineProps<{
  addresses?: UserAddress[]
}>()

const authStore = useAuthStore()
const authModal = useAuthModal()
const {
  addresses: composableAddresses,
  fetchAddresses,
  setDefaultAddress,
  selectAddress,
  loading,
} = useAddress()

const { showNotification } = useNotification()

function handleOpenLoginModal() {
  authModal.openLogin({
    redirectPath: '/account?tab=address',
    featureTitle: 'Daftar Alamat',
  })
}

const searchQuery = ref('')
const selectedAddressId = ref<string>('')
const isSettingDefault = ref(false)

const showFormModal = ref(false)
const editingAddressId = ref<string | number | null>(null)
const editingAddressData = ref<UserAddress | null>(null)

const addressList = computed<UserAddress[]>(() => {
  if (props.addresses && props.addresses.length > 0) {
    return props.addresses
  }
  return composableAddresses.value || []
})

const filteredAddresses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return addressList.value

  return addressList.value.filter((addr) => {
    const name = (addr.contact_name || addr.name || '').toLowerCase()
    const label = (addr.address_name || '').toLowerCase()
    const fullAddr = (addr.address || '').toLowerCase()
    const city = (addr.city || '').toLowerCase()
    const phone = (addr.contact_phone || addr.phone || '').toLowerCase()

    return (
      name.includes(q) ||
      label.includes(q) ||
      fullAddr.includes(q) ||
      city.includes(q) ||
      phone.includes(q)
    )
  })
})

function getAddressId(addr: UserAddress): string {
  return String(addr.id || addr._id || addr.address_id || '')
}

function isDefaultAddress(addr: UserAddress): boolean {
  return Boolean(addr.main === true || addr.main === 1 || addr.is_default === true)
}

// Check if currently selected address can be set as default
const canSetAsDefault = computed(() => {
  if (!selectedAddressId.value) return false
  const selected = addressList.value.find(
    (a) => String(getAddressId(a)) === String(selectedAddressId.value)
  )
  if (!selected) return false
  return !isDefaultAddress(selected)
})

function handleSelectAddress(addr: UserAddress) {
  selectedAddressId.value = getAddressId(addr)
  selectAddress(addr)
}

function openAddModal() {
  editingAddressId.value = null
  editingAddressData.value = null
  showFormModal.value = true
}

function openEditModal(addr: UserAddress) {
  editingAddressId.value = getAddressId(addr)
  editingAddressData.value = addr
  showFormModal.value = true
}

async function handleSetDefault() {
  if (!selectedAddressId.value) return
  isSettingDefault.value = true
  try {
    const res = await setDefaultAddress(selectedAddressId.value)
    if (res.success) {
      showNotification({
        type: 'success',
        message: 'Alamat utama berhasil diperbarui',
      })
      await fetchAddresses()
    } else {
      showNotification({
        type: 'error',
        message: res.message || 'Gagal mengubah alamat utama',
      })
    }
  } catch (err: unknown) {
    const errObj = err as { message?: string }
    showNotification({
      type: 'error',
      message: errObj?.message || 'Gagal mengubah alamat utama',
    })
  } finally {
    isSettingDefault.value = false
  }
}

async function handleAddressSaved() {
  await fetchAddresses()
  showNotification({
    type: 'success',
    message: 'Alamat berhasil disimpan',
  })
}

async function handleAddressDeleted() {
  await fetchAddresses()
  showNotification({
    type: 'success',
    message: 'Alamat berhasil dihapus',
  })
}

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    handleOpenLoginModal()
    return
  }
  if (addressList.value.length === 0) {
    await fetchAddresses()
  }
  // Initialize default selection
  const defaultAddr = addressList.value.find(isDefaultAddress) || addressList.value[0]
  if (defaultAddr) {
    selectedAddressId.value = getAddressId(defaultAddr)
  }
})
</script>
