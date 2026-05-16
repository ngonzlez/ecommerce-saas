'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/storefront/ProductCard'
import CartDrawer from '@/components/storefront/CartDrawer'

type Product = {
  id: string
  slug: string
  name: string
  price: number
  comparePrice: number | null
  images: string[]
  stock: number
  showStock: boolean
  badge: { text: string; color: string; type: string } | null
  category: { id: string; name: string; slug: string } | null
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('categoria') ?? '')
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])

  const fetchProducts = useCallback(async (q: string, cat: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (cat) params.set('categoria', cat)
    if (searchParams.get('ofertas')) params.set('ofertas', 'true')
    const res = await fetch(`/api/products/search?${params}`)
    const data = await res.json()
    setProducts(data)
    // Extract unique categories from results
    const cats = Array.from(
      new Map(
        data.filter((p: Product) => p.category).map((p: Product) => [p.category!.id, p.category!])
      ).values()
    ) as { id: string; name: string; slug: string }[]
    if (cats.length > 0) setCategories(cats)
    setLoading(false)
  }, [searchParams])

  useEffect(() => {
    const t = setTimeout(() => fetchProducts(query, activeCategory), 300)
    return () => clearTimeout(t)
  }, [query, activeCategory, fetchProducts])

  useEffect(() => {
    // Initial load: fetch all categories
    fetch('/api/products/search').then((r) => r.json()).then((data: Product[]) => {
      const cats = Array.from(
        new Map(
          data.filter((p) => p.category).map((p) => [p.category!.id, p.category!])
        ).values()
      ) as { id: string; name: string; slug: string }[]
      setCategories(cats)
    })
  }, [])

  return (
    <>
      <CartDrawer />
      <main className="pt-14 md:pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Productos</h1>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] text-sm"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category chips */}
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-6">
              <button
                onClick={() => setActiveCategory('')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${activeCategory === '' ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-gray-200 hover:border-gray-400'}`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.slug ? '' : cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${activeCategory === cat.slug ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-gray-200 hover:border-gray-400'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-100 aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No se encontraron productos</p>
              <p className="text-sm mt-1">Probá con otra búsqueda</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{products.length} productos</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    slug={p.slug}
                    name={p.name}
                    price={p.price}
                    comparePrice={p.comparePrice}
                    images={p.images}
                    stock={p.stock}
                    showStock={p.showStock}
                    badge={p.badge}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
