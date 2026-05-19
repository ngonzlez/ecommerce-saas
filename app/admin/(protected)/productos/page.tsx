'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Search, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 50

function fmtGs(v: number) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(v)
}

type Product = {
  id: string; name: string; sku: string | null; price: number; stock: number
  active: boolean; images: string[]
  category: { name: string } | null
  badge: { text: string } | null
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [inputQ, setInputQ] = useState('')
  const [loading, setLoading] = useState(true)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const load = useCallback(async (search: string, pg: number) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(pg), limit: String(PAGE_SIZE) })
    if (search) params.set('q', search)
    const res = await fetch(`/api/admin/products?${params}`)
    const data = await res.json()
    setProducts(data.products ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => { load(q, page) }, [q, page, load])

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setQ(inputQ); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [inputQ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Productos {total > 0 && <span className="text-sm font-normal text-gray-400 ml-1">({total})</span>}
        </h1>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus size={15} />
          Nuevo producto
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, SKU..."
          value={inputQ}
          onChange={e => setInputQ(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-4 py-3">
                    <div className="h-8 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                  {q ? 'Sin resultados para esa búsqueda.' : 'Sin productos aún. '}
                  {!q && <Link href="/admin/productos/nuevo" className="text-slate-700 underline">Crear el primero</Link>}
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {p.images[0] ? (
                      <div className="w-10 h-10 relative rounded-lg overflow-hidden border border-gray-200">
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    {p.sku && <p className="text-xs text-gray-400">SKU: {p.sku}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{fmtGs(p.price)}</td>
                  <td className="px-4 py-3 text-gray-700">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.badge ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">{p.badge.text}</span> : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 px-2 py-1 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <Pencil size={12} />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-500">
              Página {page} de {totalPages} — {total} productos
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
