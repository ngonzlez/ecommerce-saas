import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type VariantSelection = {
  groupId: string
  groupName: string
  optionId: string
  optionName: string
}

export type CartItem = {
  cartKey: string
  productId: string
  name: string
  price: number
  image: string | null
  quantity: number
  slug: string
  variants: VariantSelection[]
}

type CartStore = {
  items: CartItem[]
  isOpen: boolean
  couponCode: string
  discountAmount: number
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, 'quantity' | 'cartKey'>) => void
  removeItem: (cartKey: string) => void
  updateQty: (cartKey: string, qty: number) => void
  clearCart: () => void
  setCoupon: (code: string, discount: number) => void
  clearCoupon: () => void
  subtotal: () => number
}

function makeCartKey(productId: string, variants: VariantSelection[]): string {
  if (variants.length === 0) return productId
  const sorted = [...variants].sort((a, b) => a.groupId.localeCompare(b.groupId))
  return productId + '__' + sorted.map(v => v.optionId).join('_')
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
        const cartKey = makeCartKey(item.productId, item.variants)
        const { items } = get()
        const existing = items.find((i) => i.cartKey === cartKey)
        if (existing) {
          set({
            items: items.map((i) =>
              i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
            ),
            isOpen: true,
          })
        } else {
          set({ items: [...items, { ...item, cartKey, quantity: 1 }], isOpen: true })
        }
      },

      removeItem: (cartKey) =>
        set({ items: get().items.filter((i) => i.cartKey !== cartKey) }),

      updateQty: (cartKey, qty) => {
        if (qty <= 0) {
          get().removeItem(cartKey)
          return
        }
        set({
          items: get().items.map((i) => (i.cartKey === cartKey ? { ...i, quantity: qty } : i)),
        })
      },

      clearCart: () => set({ items: [], couponCode: '', discountAmount: 0 }),

      setCoupon: (code, discount) => set({ couponCode: code, discountAmount: discount }),

      clearCoupon: () => set({ couponCode: '', discountAmount: 0 }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'ecommerce-cart',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const hasLegacy = state.items.some(i => !i.cartKey || !i.variants)
        if (hasLegacy) state.items = []
      },
    }
  )
)
