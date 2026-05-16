import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: string
  name: string
  price: number
  image: string | null
  quantity: number
  slug: string
}

type CartStore = {
  items: CartItem[]
  isOpen: boolean
  couponCode: string
  discountAmount: number
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  setCoupon: (code: string, discount: number) => void
  clearCoupon: () => void
  subtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: '',
      discountAmount: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item) => {
        const { items } = get()
        const existing = items.find((i) => i.productId === item.productId)
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
            ),
            isOpen: true,
          })
        } else {
          set({ items: [...items, { ...item, quantity: 1 }], isOpen: true })
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      updateQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
        })
      },

      clearCart: () => set({ items: [], couponCode: '', discountAmount: 0 }),

      setCoupon: (code, discount) => set({ couponCode: code, discountAmount: discount }),

      clearCoupon: () => set({ couponCode: '', discountAmount: 0 }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'ecommerce-cart' }
  )
)
