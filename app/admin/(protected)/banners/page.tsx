'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface Banner {
  id: string
  type: string
  imageUrl: string | null
  title: string | null
  subtitle: string | null
  linkUrl: string | null
  linkText: string | null
  position: string
  order: number
  enabled: boolean
}

const TABS = [
  { value: 'hero', label: 'Hero' },
  { value: 'info', label: 'Info / Anuncio' },
  { value: 'promo', label: 'Promo' },
  { value: 'ofertas', label: 'Ofertas' },
]

const POSITIONS = [
  { value: 'top', label: 'Arriba (antes de categorías)' },
  { value: 'middle', label: 'Medio (antes de destacados)' },
  { value: 'bottom', label: 'Final (después de ofertas)' },
]

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

function emptyForm() {
  return { type: 'hero', imageUrl: '', title: '', subtitle: '', linkUrl: '', linkText: '', position: 'top', order: 0, enabled: true }
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hero')
  const [modal, setModal] = useState<'new' | string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/banners')
    const data = await res.json()
    setBanners(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = banners.filter(b => b.type === activeTab)

  function openNew() {
    setForm({ ...emptyForm(), type: activeTab })
    setModal('new')
  }

  function openEdit(b: Banner) {
    setForm({ type: b.type, imageUrl: b.imageUrl ?? '', title: b.title ?? '', subtitle: b.subtitle ?? '', linkUrl: b.linkUrl ?? '', linkText: b.linkText ?? '', position: b.position ?? 'top', order: b.order, enabled: b.enabled })
    setModal(b.id)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setForm(f => ({ ...f, imageUrl: data.url }))
    setUploading(false)
  }

  async function save() {
    setSaving(true)
    const body = { ...form, order: Number(form.order), imageUrl: form.imageUrl || null, linkText: form.linkText || null }
    const res = modal === 'new'
      ? await fetch('/api/admin/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch(`/api/admin/banners/${modal}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      setModal(null)
      await load()
      toast.success(modal === 'new' ? 'Banner creado' : 'Guardado correctamente')
    }
    setSaving(false)
  }

  async function deleteBanner(id: string) {
    if (!confirm('¿Eliminar este banner?')) return
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    await load()
    toast.success('Eliminado')
  }

  async function toggleEnabled(b: Banner) {
    await fetch(`/api/admin/banners/${b.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...b, enabled: !b.enabled }),
    })
    await load()
    toast.success('Guardado correctamente')
  }

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Banners</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
          <Plus size={15} />
          Nuevo banner
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.value
                ? 'border-slate-700 text-slate-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(b => (
          <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 p-4">
            {b.imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={b.imageUrl} alt={b.title ?? ''} className="w-24 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{b.title || 'Sin título'}</p>
              {b.subtitle && <p className="text-sm text-gray-500 truncate">{b.subtitle}</p>}
              {b.type === 'promo' && <p className="text-xs text-purple-500">{POSITIONS.find(p => p.value === b.position)?.label ?? b.position}</p>}
              {b.linkUrl && <p className="text-xs text-blue-500 truncate">{b.linkUrl}</p>}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-gray-400">Orden: {b.order}</span>
              <button onClick={() => toggleEnabled(b)}>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {b.enabled ? 'Activo' : 'Inactivo'}
                </span>
              </button>
              <button onClick={() => openEdit(b)} className="text-slate-600 hover:text-slate-800"><Pencil size={14} /></button>
              <button onClick={() => deleteBanner(b.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-400 text-sm">
            Sin banners en esta sección.
          </div>
        )}
      </div>

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">{modal === 'new' ? 'Nuevo banner' : 'Editar banner'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Tipo</label>
                  <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {TABS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Orden</label>
                  <input type="number" min="0" className={inputCls} value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
                </div>
              </div>
              {form.type === 'promo' && (
                <div>
                  <label className={labelCls}>Posición en el home</label>
                  <select className={inputCls} value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                    {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              )}
              {form.type !== 'info' && (
                <div>
                  <label className={labelCls}>Imagen</label>
                  <input className={inputCls + ' mb-2'} value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="URL de imagen" />
                  <label className="cursor-pointer flex items-center gap-2 text-sm text-slate-700 border border-dashed border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">
                    <Upload size={14} />
                    {uploading ? 'Subiendo...' : 'Subir imagen'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  {form.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={form.imageUrl} alt="" className="mt-2 w-full h-28 object-cover rounded-lg border border-gray-200" />
                  )}
                </div>
              )}
              <div>
                <label className={labelCls}>{form.type === 'info' ? 'Texto del anuncio' : 'Título'}</label>
                <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              {form.type !== 'info' && (
                <div>
                  <label className={labelCls}>Subtítulo</label>
                  <input className={inputCls} value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
                </div>
              )}
              <div>
                <label className={labelCls}>URL destino</label>
                <input className={inputCls} value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <label className={labelCls}>{form.type === 'info' ? 'Texto del enlace (opcional)' : 'Texto del botón (opcional)'}</label>
                <input className={inputCls} value={form.linkText} onChange={e => setForm(f => ({ ...f, linkText: e.target.value }))} placeholder={form.type === 'info' ? 'Ver más' : 'Comprar ahora'} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-700">Banner activo</span>
              </label>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setModal(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button onClick={save} disabled={saving} className="flex-1 bg-slate-800 text-white text-sm py-2 rounded-lg hover:bg-slate-700 disabled:opacity-60">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
