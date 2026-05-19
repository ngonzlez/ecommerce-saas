'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/cart'
import { useFavoritesStore } from '@/lib/favorites'
import { formatPrice, calcDiscountPercent } from '@/lib/format'
import { toast } from 'sonner'

type Badge = { text: string; color: string; type: string } | null

type Props = {
  id: string
  slug: string
  name: string
  price: number
  comparePrice?: number | null
  images: string[]
  stock: number
  showStock: boolean
  trackStock: boolean
  badge?: Badge
}

const BADGE_COLORS: Record<string, string> = {
  red: 'bg-red-500 text-white',
  green: 'bg-green-500 text-white',
  blue: 'bg-blue-500 text-white',
  orange: 'bg-orange-500 text-white',
  black: 'bg-black text-white',
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  comparePrice,
  images,
  stock,
  showStock,
  trackStock,
  badge,
}: Props) {
  const [imgIdx, setImgIdx] = useState(0)
  const [mounted, setMounted] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const { toggle: toggleFav, isFavorite } = useFavoritesStore()
  const fav = mounted && isFavorite(id)

  useEffect(() => setMounted(true), [])

  const discountPct =
    comparePrice && comparePrice > price ? calcDiscountPercent(price, comparePrice) : null

  const displayBadge =
    badge ?? (discountPct ? { text: `${discountPct}%`, color: 'red', type: 'discount' } : null)

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    addItem({ productId: id, name, price, image: images[0] ?? null, slug, variants: [] })
    toast.success(`${name} agregado al carrito`)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <Link href={`/productos/${slug}`}>
        {/* Image area */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {images.length > 0 ? (
            <Image
              src={images[imgIdx]}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">Sin imagen</div>
          )}

          {/* Badge */}
          {displayBadge && (
            <span className={cn('absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full', BADGE_COLORS[displayBadge.color] ?? 'bg-black text-white')}>
              {displayBadge.text}
            </span>
          )}

          {/* Favorite */}
          <button
            onClick={(e) => {
              e.preventDefault()
              toggleFav({ productId: id, slug, name, price, comparePrice: comparePrice ?? null, image: images[0] ?? null, stock, showStock, trackStock, badge: badge ?? null })
              toast(fav ? 'Eliminado de favoritos' : 'Agregado a favoritos')
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart size={15} className={fav ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
          </button>

          {/* Image carousel dots */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); setImgIdx((i) => Math.max(0, i - 1)) }}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={12} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setImgIdx((i) => Math.min(images.length - 1, i + 1)) }}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={12} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.preventDefault(); setImgIdx(i) }}
                    className={cn('w-1.5 h-1.5 rounded-full transition-all', i === imgIdx ? 'bg-white scale-125' : 'bg-white/60')}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-sm font-medium leading-tight line-clamp-2 mb-1">{name}</p>
          {showStock && trackStock && (
            <p className={cn('text-xs mb-1', stock <= 5 && stock > 0 ? 'text-orange-500' : stock === 0 ? 'text-red-500' : 'text-gray-400')}>
              {stock === 0 ? 'Sin stock' : stock <= 5 ? `¡Últimas ${stock} unidades!` : `Stock: ${stock}`}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
              {formatPrice(price)}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(comparePrice)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-3 pb-3">
        <button
          onClick={handleAddToCart}
          disabled={trackStock && stock === 0}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white hover:opacity-90 active:scale-95"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <ShoppingCart size={15} />
          {trackStock && stock === 0 ? 'Sin stock' : 'Agregar'}
        </button>
      </div>
    </motion.div>
  )
}
