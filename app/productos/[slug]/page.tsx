'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Heart, ShoppingCart, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/cart'
import { formatPrice, calcDiscountPercent } from '@/lib/format'

const BADGE_COLORS: Record<string, string> = {
  red: 'bg-red-500 text-white',
  green: 'bg-green-500 text-white',
  blue: 'bg-blue-500 text-white',
  orange: 'bg-orange-500 text-white',
  black: 'bg-black text-white',
}

type ProductData = {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  comparePrice: number | null
  stock: number
  showStock: boolean
  images: string[]
  category: { name: string; slug: string } | null
  badge: { text: string; color: string; type: string } | null
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>()
  const addItem = useCartStore((s) => s.addItem)

  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${params.slug}`)
        if (res.status === 404) { setNotFound(true); return }
        if (!res.ok) { setNotFound(true); return }
        const data = await res.json()
        setProduct(data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.slug])

  if (loading) {
    return (
      <main className="pt-20 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded-lg animate-pulse w-3/4" />
              <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-1/3" />
              <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (notFound || !product) {
    return (
      <main className="pt-20 min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
        <p className="text-xl">Producto no encontrado</p>
        <Link href="/productos" className="text-sm font-medium underline" style={{ color: 'var(--color-primary)' }}>
          Ver todos los productos
        </Link>
      </main>
    )
  }

  const discountPct =
    product.comparePrice && product.comparePrice > product.price
      ? calcDiscountPercent(product.price, product.comparePrice)
      : null

  const images = product.images.length > 0 ? product.images : []
  const hasImages = images.length > 0

  function handleAddToCart() {
    if (product!.stock === 0) return
    for (let i = 0; i < qty; i++) {
      addItem({
        productId: product!.id,
        slug: product!.slug,
        name: product!.name,
        price: product!.price,
        image: images[0] ?? null,
      })
    }
    toast.success(`${product!.name} agregado al carrito`, { duration: 2000 })
  }

  return (
    <main className="pt-14 md:pt-16 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/productos" className="flex items-center gap-1 hover:text-gray-700 transition-colors">
            <ArrowLeft size={14} />
            Productos
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/productos?categoria=${product.category.slug}`} className="hover:text-gray-700 transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-700 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border">
              {hasImages ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={imgIdx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={images[imgIdx]}
                        alt={product.name}
                        fill
                        className="object-contain p-4"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white transition-colors z-10"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white transition-colors z-10"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                  <ShoppingCart size={64} />
                </div>
              )}

              {/* Badge */}
              {product.badge && (
                <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full z-10 ${BADGE_COLORS[product.badge.color] ?? 'bg-gray-500 text-white'}`}>
                  {product.badge.text}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${i === imgIdx ? 'border-[var(--color-primary)]' : 'border-transparent'}`}
                  >
                    <Image src={src} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            {product.category && (
              <Link
                href={`/productos?categoria=${product.category.slug}`}
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-primary)' }}
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
              )}
              {discountPct && (
                <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  -{discountPct}%
                </span>
              )}
            </div>

            {/* Stock */}
            {product.showStock && (
              <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
              </p>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            )}

            {/* Qty + Add to cart */}
            {product.stock > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold border-x">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(product!.stock, q + 1))}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <ShoppingCart size={18} />
                    Agregar al carrito
                  </motion.button>
                  <button
                    className="w-12 h-12 flex items-center justify-center rounded-xl border hover:border-red-300 hover:text-red-500 transition-colors"
                    aria-label="Agregar a favoritos"
                  >
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-3 px-4 rounded-xl bg-gray-100 text-center text-sm text-gray-500 font-medium">
                Producto sin stock
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
