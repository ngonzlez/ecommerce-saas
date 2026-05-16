import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type FavoriteItem = {
  productId: string
  slug: string
  name: string
  price: number
  comparePrice: number | null
  image: string | null
  stock: number
  showStock: boolean
  badge: { text: string; color: string; type: string } | null
}

type FavoritesStore = {
  items: FavoriteItem[]
  toggle: (item: FavoriteItem) => void
  isFavorite: (productId: string) => boolean
  remove: (productId: string) => void
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId)
        set({
          items: exists
            ? get().items.filter((i) => i.productId !== item.productId)
            : [...get().items, item],
        })
      },
      isFavorite: (productId) => get().items.some((i) => i.productId === productId),
      remove: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
    }),
    { name: 'favorites-storage' }
  )
)
