'use client'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useFavoritesStore } from '@/lib/favorites'
import ProductCard from '@/components/storefront/ProductCard'

export default function FavoritosPage() {
  const { items } = useFavoritesStore()

  if (items.length === 0) {
    return (
      <main className="pt-14 md:pt-16 min-h-screen flex flex-col items-center justify-center gap-4">
        <Heart size={48} className="text-gray-200" />
        <p className="text-gray-400 text-lg">No tenés productos en favoritos</p>
        <Link href="/productos" className="text-sm font-medium underline" style={{ color: 'var(--color-primary)' }}>
          Explorar tienda
        </Link>
      </main>
    )
  }

  return (
    <main className="pt-14 md:pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Heart size={22} className="fill-red-500 text-red-500" />
          <h1 className="text-2xl font-bold">Mis favoritos</h1>
          <span className="text-sm text-gray-400 ml-1">({items.length})</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {items.map((p) => (
            <ProductCard
              key={p.productId}
              id={p.productId}
              slug={p.slug}
              name={p.name}
              price={p.price}
              comparePrice={p.comparePrice}
              images={p.image ? [p.image] : []}
              stock={p.stock}
              showStock={p.showStock}
              badge={p.badge}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
