'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check, Upload, ShoppingBag, Shirt, Tv, Smartphone, Home, Utensils, BookOpen, Dumbbell, Baby, Car, Heart, Laptop, Watch, Camera, Music, Gamepad2, Flower, Dog, Plane, Coffee, Package, Tag, Sparkles, Bike, Gem } from 'lucide-react'
import { toast } from 'sonner'

const ICONS = [
  { name: 'ShoppingBag', Icon: ShoppingBag, label: 'Bolsa' },
  { name: 'Shirt', Icon: Shirt, label: 'Ropa' },
  { name: 'Tv', Icon: Tv, label: 'TV' },
  { name: 'Smartphone', Icon: Smartphone, label: 'Celular' },
  { name: 'Laptop', Icon: Laptop, label: 'Laptop' },
  { name: 'Camera', Icon: Camera, label: 'Cámara' },
  { name: 'Watch', Icon: Watch, label: 'Reloj' },
  { name: 'Gem', Icon: Gem, label: 'Joyería' },
  { name: 'Home', Icon: Home, label: 'Hogar' },
  { name: 'Utensils', Icon: Utensils, label: 'Cocina' },
  { name: 'Coffee', Icon: Coffee, label: 'Café' },
  { name: 'Baby', Icon: Baby, label: 'Bebé' },
  { name: 'Dumbbell', Icon: Dumbbell, label: 'Deporte' },
  { name: 'Bike', Icon: Bike, label: 'Bici' },
  { name: 'Car', Icon: Car, label: 'Auto' },
  { name: 'Plane', Icon: Plane, label: 'Viajes' },
  { name: 'BookOpen', Icon: BookOpen, label: 'Libros' },
  { name: 'Music', Icon: Music, label: 'Música' },
  { name: 'Gamepad2', Icon: Gamepad2, label: 'Gaming' },
  { name: 'Dog', Icon: Dog, label: 'Mascotas' },
  { name: 'Flower', Icon: Flower, label: 'Flores' },
  { name: 'Heart', Icon: Heart, label: 'Salud' },
  { name: 'Sparkles', Icon: Sparkles, label: 'Belleza' },
  { name: 'Package', Icon: Package, label: 'General' },
  { name: 'Tag', Icon: Tag, label: 'Otros' },
]

function IconDisplay({ name, size = 18 }: { name: string; size?: number }) {
  const found = ICONS.find(i => i.name === name)
  if (!found) return <Package size={size} />
  const { Icon } = found
  return <Icon size={size} />
}

interface Category { id: string; name: string; slug: string; imageUrl: string | null; icon: string | null }

const emptyForm = () => ({ name: '', slug: '', imageUrl: '', icon: '' })

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'new' | string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/categories')
    setCategories(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(emptyForm()); setModal('new') }
  function openEdit(cat: Category) {
    setForm({ name: cat.name, slug: cat.slug, imageUrl: cat.imageUrl ?? '', icon: cat.icon ?? '' })
    setModal(cat.id)
  }

  async function uploadImage(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setForm(f => ({ ...f, imageUrl: data.url, icon: '' }))
    else toast.error('Error al subir imagen')
    setUploading(false)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    const body = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      imageUrl: form.icon ? null : (form.imageUrl || null),
      icon: form.icon || null,
    }
    const isNew = modal === 'new'
    const res = isNew
      ? await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch(`/api/admin/categories/${modal}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

    if (res.ok) {
      toast.success(isNew ? 'Categoría creada' : 'Guardado correctamente')
      setModal(null)
      load()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Error al guardar')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta categoría?')) return
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    toast.success('Eliminado')
    load()
  }

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Categorías</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
          <Plus size={15} /> Nueva categoría
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
              {cat.imageUrl
                /* eslint-disable-next-line @next/next/no-img-element */
                ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                : cat.icon
                  ? <span className="text-slate-600"><IconDisplay name={cat.icon} size={20} /></span>
                  : <Tag size={18} className="text-slate-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">{cat.name}</p>
              <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-slate-700 rounded-lg hover:bg-gray-100"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            <Tag size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Sin categorías. Creá la primera.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">{modal === 'new' ? 'Nueva categoría' : 'Editar categoría'}</h2>
              <button onClick={() => setModal(null)} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className={labelCls}>Nombre *</label>
                <input className={inputCls} value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) })) }} placeholder="Ej: Electrónica" />
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input className={inputCls} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="electronica" />
              </div>

              {/* Image or Icon toggle */}
              <div>
                <label className={labelCls}>Imagen o Ícono</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, icon: '' }))}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-all ${!form.icon ? 'border-slate-700 bg-slate-50 font-semibold text-slate-800' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
                  >
                    Imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, imageUrl: '', icon: f.icon || 'ShoppingBag' }))}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-all ${form.icon ? 'border-slate-700 bg-slate-50 font-semibold text-slate-800' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
                  >
                    Ícono
                  </button>
                </div>

                {!form.icon ? (
                  <div className="space-y-2">
                    <input className={inputCls} value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="URL de la imagen" />
                    <label className="cursor-pointer flex items-center gap-2 text-sm text-slate-700 border border-dashed border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">
                      <Upload size={14} />
                      {uploading ? 'Subiendo...' : 'Subir imagen'}
                      <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f) }} />
                    </label>
                    {form.imageUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={form.imageUrl} alt="preview" className="h-16 w-16 object-cover rounded-xl border" />
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-2">
                    {ICONS.map(({ name, Icon, label }) => (
                      <button
                        key={name}
                        type="button"
                        title={label}
                        onClick={() => setForm(f => ({ ...f, icon: name }))}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${form.icon === name ? 'border-slate-700 bg-slate-50' : 'border-gray-200 hover:border-gray-400'}`}
                      >
                        <Icon size={18} className={form.icon === name ? 'text-slate-700' : 'text-gray-500'} />
                        <span className="text-[9px] text-gray-400 leading-none text-center">{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} disabled={saving || uploading} className="px-5 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-60 flex items-center gap-2">
                <Check size={14} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
