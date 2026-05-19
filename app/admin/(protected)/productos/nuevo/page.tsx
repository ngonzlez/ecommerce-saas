'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Upload, Plus, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'

interface Category { id: string; name: string }

type VariantOption = { name: string; order: number }
type VariantGroup = { name: string; required: boolean; order: number; options: VariantOption[] }

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

export default function NuevoProductoPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImg, setUploadingImg] = useState(false)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [stock, setStock] = useState('0')
  const [showStock, setShowStock] = useState(false)
  const [trackStock, setTrackStock] = useState(false)
  const [sku, setSku] = useState('')
  const [featured, setFeatured] = useState(false)
  const [active, setActive] = useState(true)
  const [categoryId, setCategoryId] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [hasBadge, setHasBadge] = useState(false)
  const [badgeText, setBadgeText] = useState('')
  const [badgeColor, setBadgeColor] = useState('red')
  const [badgeType, setBadgeType] = useState('custom')
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([])

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(setCategories)
  }, [])

  function handleNameChange(v: string) {
    setName(v)
    setSlug(slugify(v))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setUploadingImg(true)
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) setImages(prev => [...prev, data.url])
      }
    } finally {
      setUploadingImg(false)
    }
  }

  function addVariantGroup() {
    setVariantGroups(prev => [...prev, { name: '', required: true, order: prev.length, options: [] }])
  }

  function removeVariantGroup(gi: number) {
    setVariantGroups(prev => prev.filter((_, i) => i !== gi))
  }

  function updateGroup(gi: number, patch: Partial<VariantGroup>) {
    setVariantGroups(prev => prev.map((g, i) => i === gi ? { ...g, ...patch } : g))
  }

  function addOption(gi: number) {
    setVariantGroups(prev => prev.map((g, i) => i === gi
      ? { ...g, options: [...g.options, { name: '', order: g.options.length }] }
      : g
    ))
  }

  function removeOption(gi: number, oi: number) {
    setVariantGroups(prev => prev.map((g, i) => i === gi
      ? { ...g, options: g.options.filter((_, j) => j !== oi) }
      : g
    ))
  }

  function updateOption(gi: number, oi: number, name: string) {
    setVariantGroups(prev => prev.map((g, i) => i === gi
      ? { ...g, options: g.options.map((o, j) => j === oi ? { ...o, name } : o) }
      : g
    ))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = {
        name,
        slug,
        description,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : null,
        stock: Number(stock),
        showStock,
        trackStock,
        sku: sku || null,
        featured,
        active,
        categoryId: categoryId || null,
        images,
        badge: hasBadge && badgeText ? { text: badgeText, color: badgeColor, type: badgeType } : null,
        variantGroups: variantGroups
          .filter(g => g.name.trim())
          .map((g, gi) => ({
            name: g.name,
            required: g.required,
            order: gi,
            options: g.options.filter(o => o.name.trim()).map((o, oi) => ({ name: o.name, order: oi })),
          })),
      }
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Error al crear producto')
        toast.error(d.error ?? 'Error al guardar')
      } else {
        toast.success('Producto creado')
        router.push('/admin/productos')
      }
    } catch {
      setError('Error inesperado')
      toast.error('Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Nuevo producto</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="font-semibold text-gray-800 mb-2">Información básica</h2>
              <div>
                <label className={labelCls}>Nombre *</label>
                <input className={inputCls} value={name} onChange={e => handleNameChange(e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input className={inputCls} value={slug} onChange={e => setSlug(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea
                  className={inputCls + ' resize-y min-h-[100px]'}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Precio (Gs.) *</label>
                  <input type="number" min="0" className={inputCls} value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
                <div>
                  <label className={labelCls}>Precio anterior (Gs.)</label>
                  <input type="number" min="0" className={inputCls} value={comparePrice} onChange={e => setComparePrice(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Stock</label>
                  <input type="number" min="0" className={inputCls} value={stock} onChange={e => setStock(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>SKU</label>
                  <input className={inputCls} value={sku} onChange={e => setSku(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Clasificaciones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-800">Clasificaciones</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Sabor, talle, color, etc. El cliente elige antes de agregar al carrito.</p>
                </div>
                <button
                  type="button"
                  onClick={addVariantGroup}
                  className="flex items-center gap-1.5 text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Plus size={13} /> Agregar
                </button>
              </div>

              {variantGroups.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                  Sin clasificaciones. Este producto no tiene opciones.
                </p>
              ) : (
                <div className="space-y-4">
                  {variantGroups.map((group, gi) => (
                    <div key={gi} className="border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <GripVertical size={14} className="text-gray-300 shrink-0" />
                        <input
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
                          value={group.name}
                          onChange={e => updateGroup(gi, { name: e.target.value })}
                          placeholder="Ej: Sabor, Talle, Color"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={group.required}
                            onChange={e => updateGroup(gi, { required: e.target.checked })}
                            className="rounded"
                          />
                          Obligatorio
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVariantGroup(gi)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="pl-5 space-y-2">
                        {group.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
                              value={opt.name}
                              onChange={e => updateOption(gi, oi, e.target.value)}
                              placeholder={`Opción ${oi + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(gi, oi)}
                              className="p-1 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(gi)}
                          className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1 mt-1"
                        >
                          <Plus size={12} /> Agregar opción
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-3">Imágenes</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="cursor-pointer flex items-center gap-2 text-sm text-slate-700 border border-dashed border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors">
                <Upload size={15} />
                {uploadingImg ? 'Subiendo...' : 'Subir imágenes'}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
              </label>
            </div>

            {/* Badge */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-800">Badge</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={hasBadge} onChange={e => setHasBadge(e.target.checked)} className="rounded" />
                  <span className="text-sm text-gray-600">Añadir badge</span>
                </label>
              </div>
              {hasBadge && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Texto</label>
                    <input className={inputCls} value={badgeText} onChange={e => setBadgeText(e.target.value)} placeholder="Oferta" />
                  </div>
                  <div>
                    <label className={labelCls}>Color</label>
                    <select className={inputCls} value={badgeColor} onChange={e => setBadgeColor(e.target.value)}>
                      <option value="red">Rojo</option>
                      <option value="green">Verde</option>
                      <option value="blue">Azul</option>
                      <option value="orange">Naranja</option>
                      <option value="black">Negro</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Tipo</label>
                    <select className={inputCls} value={badgeType} onChange={e => setBadgeType(e.target.value)}>
                      <option value="discount">Descuento</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar options */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="font-semibold text-gray-800 mb-2">Opciones</h2>
              <div>
                <label className={labelCls}>Categoría</label>
                <select className={inputCls} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="">Sin categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Producto activo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Destacado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={trackStock} onChange={e => setTrackStock(e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Controlar stock</span>
                <span className="text-xs text-gray-400">(bloquea compra si llega a 0)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showStock} onChange={e => setShowStock(e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Mostrar cantidad disponible</span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push('/admin/productos')}
                className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-slate-800 text-white text-sm py-2 rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors"
              >
                {loading ? 'Guardando...' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
