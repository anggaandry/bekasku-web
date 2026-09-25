import { defineStore } from 'pinia'
import { STORAGE_KEY_CART } from '~/utils/constants'

export interface CartItem {
  id: string
  product_id: string
  name: string
  price: number
  image: string
  quantity: number
  seller_id?: string
  seller_name?: string
  city?: string
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalItems = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((total, item) => total + item.price * item.quantity, 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  function saveToStorage() {
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(items.value))
      } catch {
        // ignore
      }
    }
  }

  function initFromStorage() {
    if (import.meta.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CART)
        if (stored) {
          items.value = JSON.parse(stored)
        }
      } catch {
        // ignore
      }
    }
  }

  function addItem(item: CartItem) {
    const existing = items.value.find((i) => i.product_id === item.product_id)
    if (existing) {
      existing.quantity += item.quantity || 1
    } else {
      items.value.push({ ...item, quantity: item.quantity || 1 })
    }
    saveToStorage()
  }

  function removeItem(productId: string) {
    items.value = items.value.filter((i) => i.product_id !== productId)
    saveToStorage()
  }

  function clearCart() {
    items.value = []
    saveToStorage()
  }

  return {
    items,
    totalItems,
    totalPrice,
    isEmpty,
    addItem,
    removeItem,
    clearCart,
    initFromStorage,
  }
})
