'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check, MapPin, Building2, Store, Phone, Clock, Globe, Landmark, Navigation, Warehouse, Coffee, ShoppingBag, Home } from 'lucide-react'
import { toast } from 'sonner'

const ICONS = [
  { name: 'MapPin', Icon: MapPin, label: 'Ubicación' },
  { name: 'Building2', Icon: Building2, label: 'Edificio' },
  { name: 'Store', Icon: Store, label: 'Tienda' },
  { name: 'Home', Icon: Home, label: 'Casa' },
  { name: 'Landmark', Icon: Landmark, label: 'Edificio oficial' },
  { name: 'Warehouse', Icon: Warehouse, label: 'Depósito' },
  { name: 'Coffee', Icon: Coffee, label: 'Café' },
  { name: 'ShoppingBag', Icon: ShoppingBag, label: 'Compras' },
  { name: 'Phone', Icon: Phone, label: 'Teléfono' },
  { name: 'Clock', Icon: Clock, label: 'Horario' },
  { name: 'Globe', Icon: Globe, label: 'Globo' },
  { name: 'Navigation', Icon: Navigation, label: 'Navegación' },
]

function IconDisplay({ name, size = 18 }: { name: string; size?: number }) {
  const found = ICONS.find(i => i.name === name)
  if (!found) return <MapPin size={size} />
  const { Icon } = found
  return <Icon size={size} />
}

type Branch = {
  id: string
  name: string
  address: string | null
  city: string | null
  phone: string | null
  hours: string | null
  icon: string
  mapUrl: string | null
  order: number
  enabled: boolean
}

const empty = (): Omit<Branch, 'id'> => ({
  name: '',
  address: '',
  city: '',
  phone: '',
  hours: '',
  icon: 'MapPin',
  mapUrl: '',
  order: 0,
  enabled: true,
})

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

export default function SucursalesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'new' | string | null>(null)
  const [form, setForm] = useState(empty())

  async function load() {
    const res = await fetch('/api/admin/branches')
    const data = await res.json()
    setBranches(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(empty()); setModal('new') }
  function openEdit(b: Branch) { setForm({ name: b.name, address: b.address ?? '', city: b.city ?? '', phone: b.phone ?? '', hours: b.hours ?? '', icon: b.icon, mapUrl: b.mapUrl ?? '', order: b.order, enabled: b.enabled }); setModal(b.id) }
  function closeModal() { setModal(null) }

  async function handleSave() {
    const isNew = modal === 'new'
    const res = isNew
      ? await fetch('/api/admin/branches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      : await fetch(`/api/admin/branches/${modal}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })

    if (res.ok) {
      toast.success(isNew ? 'Sucursal creada' : 'Guardado correctamente')
      closeModal()
      load()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Error al guardar')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta sucursal?')) return
    const res = await fetch(`/api/admin/branches/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Eliminado'); load() }
  }

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sucursales</h1>
          <p className="text-sm text-gray-500 mt-0.5">Aparecen en la página de contacto de la tienda</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
          <Plus size={15} /> Nueva sucursal
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          <MapPin size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Sin sucursales. Agregá la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map(b => (
            <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                <IconDisplay name={b.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm">{b.name}</p>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(b)} className="p-1.5 text-gray-400 hover:text-slate-700 rounded-lg hover:bg-gray-100"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                </div>
                {b.address && <p className="text-xs text-gray-500 mt-0.5">{b.address}{b.city ? `, ${b.city}` : ''}</p>}
                {b.phone && <p className="text-xs text-gray-500">{b.phone}</p>}
                {b.hours && <p className="text-xs text-gray-400 mt-1">{b.hours}</p>}
                {!b.enabled && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full mt-1 inline-block">Inactiva</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">{modal === 'new' ? 'Nueva sucursal' : 'Editar sucursal'}</h2>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Nombre *</label>
                <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Sucursal Centro" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Dirección</label>
                  <input className={inputCls} value={form.address ?? ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Av. Principal 123" />
                </div>
                <div>
                  <label className={labelCls}>Ciudad</label>
                  <input className={inputCls} value={form.city ?? ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Asunción" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input className={inputCls} value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0981 123 456" />
                </div>
                <div>
                  <label className={labelCls}>Horario</label>
                  <input className={inputCls} value={form.hours ?? ''} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} placeholder="Lun-Vie 8:00-18:00" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Link de ubicación (Google Maps)</label>
                <input
                  className={inputCls}
                  value={form.mapUrl ?? ''}
                  onChange={e => setForm(f => ({ ...f, mapUrl: e.target.value }))}
                  placeholder="https://maps.google.com/?q=..."
                />
                <p className="text-[10px] text-gray-400 mt-1">Abrí Google Maps → compartir → copiar link</p>
              </div>
              <div>
                <label className={labelCls}>Orden</label>
                <input type="number" className={inputCls} value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
              </div>
              {/* Icon selector */}
              <div>
                <label className={labelCls}>Ícono</label>
                <div className="grid grid-cols-6 gap-2 mt-1">
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
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} className="rounded" />
                Activa (visible en la tienda)
              </label>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t">
              <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} className="px-5 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2">
                <Check size={14} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
