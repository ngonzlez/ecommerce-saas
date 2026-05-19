'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/storefront/ProductCard'
import PriceRangeSlider from '@/components/ui/PriceRangeSlider'

const MAX_PRICE = 2000000
const MIN_PRICE = 0

type Product = {
  id: string; slug: string; name: string; price: number
  comparePrice: number | null; images: string[]; stock: number
  showStock: boolean; trackStock: boolean; badge: { text: string; color: string; type: string } | null
  category: { id: string; name: string; slug: string } | null
}

type Category = { id: string; name: string; slug: string }

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('categoria') ?? '')
  const [categories, setCategories] = useState<Category[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filtered = allProducts.filter(
    (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
  )

  const fetchProducts = useCallback(async (q: string, cat: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (cat) params.set('categoria', cat)
    if (searchParams.get('ofertas')) params.set('ofertas', 'true')
    const res = await fetch(`/api/products/search?${params}`)
    const data = await res.json()
    setAllProducts(data)
    setLoading(false)
  }, [searchParams])

  useEffect(() => {
    const t = setTimeout(() => fetchProducts(query, activeCategory), 300)
    return () => clearTimeout(t)
  }, [query, activeCategory, fetchProducts])

  useEffect(() => {
    fetch('/api/products/search').then((r) => r.json()).then((data: Product[]) => {
      const cats = Array.from(
        new Map(data.filter((p) => p.category).map((p) => [p.category!.id, p.category!])).values()
      ) as Category[]
      setCategories(cats)
    })
  }, [])

  const clearFilters = () => {
    setActiveCategory('')
    setPriceRange([MIN_PRICE, MAX_PRICE])
    setQuery('')
  }

  const hasActiveFilters = activeCategory || query || priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE

  const Sidebar = () => (
    <aside className="w-full space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">Categorías</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setActiveCategory('')}
              className={`w-full text-left text-sm py-1.5 px-2 rounded-lg transition-colors ${activeCategory === '' ? 'font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
              style={activeCategory === '' ? { color: 'var(--color-primary)' } : {}}
            >
              Todos los productos
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setActiveCategory(activeCategory === cat.slug ? '' : cat.slug)}
                className={`w-full text-left text-sm py-1.5 px-2 rounded-lg transition-colors flex items-center gap-2 ${activeCategory === cat.slug ? 'font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                style={activeCategory === cat.slug ? { color: 'var(--color-primary)' } : {}}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: activeCategory === cat.slug ? 'var(--color-primary)' : '#d1d5db' }} />
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">Filtrar por precio</h3>
        <PriceRangeSlider
          min={MIN_PRICE}
          max={MAX_PRICE}
          values={priceRange}
          onChange={setPriceRange}
          step={10000}
        />
        <button
          onClick={() => setPriceRange([MIN_PRICE, MAX_PRICE])}
          className="mt-3 w-full py-1.5 text-xs rounded-lg border transition-colors hover:bg-gray-50 text-gray-500"
        >
          Limpiar rango
        </button>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
        >
          <X size={12} /> Limpiar todos los filtros
        </button>
      )}
    </aside>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Tienda</h1>
          {/* Mobile: toggle sidebar */}
          <button
            className="md:hidden flex items-center gap-2 text-sm font-medium border rounded-lg px-3 py-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <SlidersHorizontal size={16} />
            Filtros
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-red-500" />}
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden bg-white rounded-2xl border p-5 mb-6">
            <Sidebar />
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden md:block w-56 shrink-0">
            <div className="bg-white rounded-2xl border p-5 sticky top-20">
              <Sidebar />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search */}
            <div className="relative mb-6">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[var(--color-primary)] text-sm"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-gray-100 aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg">No se encontraron productos</p>
                <p className="text-sm mt-1">Probá con otra búsqueda o ajustá los filtros</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">{filtered.length} productos</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {filtered.map((p) => (
                    <ProductCard
                      key={p.id} id={p.id} slug={p.slug} name={p.name}
                      price={p.price} comparePrice={p.comparePrice}
                      images={p.images} stock={p.stock} showStock={p.showStock} trackStock={p.trackStock} badge={p.badge}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
