'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface ShippingMethod {
  id: string
  name: string
  description: string | null
  type: string
  price: number
  enabled: boolean
  order: number
}

function fmtGs(v: number) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0,
  }).format(v)
}

const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

function emptyForm() {
  return { name: '', description: '', type: 'delivery', price: '0', enabled: true, order: 0 }
}

export default function EnviosPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(emptyForm())
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/shipping')
    const data = await res.json()
    setMethods(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startEdit(m: ShippingMethod) {
    setEditId(m.id)
    setEditForm({ name: m.name, description: m.description ?? '', type: m.type, price: m.price.toString(), enabled: m.enabled, order: m.order })
  }

  async function saveEdit() {
    if (!editId) return
    setSaving(true)
    await fetch(`/api/admin/shipping/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, price: Number(editForm.price) }),
    })
    setEditId(null)
    await load()
    toast.success('Guardado correctamente')
    setSaving(false)
  }

  async function createMethod() {
    if (!newForm.name.trim()) return
    setSaving(true)
    await fetch('/api/admin/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newForm, price: Number(newForm.price) }),
    })
    setNewForm(emptyForm())
    setShowNew(false)
    await load()
    toast.success('Envío creado')
    setSaving(false)
  }

  async function deleteMethod(id: string) {
    if (!confirm('¿Eliminar este método?')) return
    await fetch(`/api/admin/shipping/${id}`, { method: 'DELETE' })
    await load()
    toast.success('Eliminado')
  }

  async function toggleEnabled(m: ShippingMethod) {
    await fetch(`/api/admin/shipping/${m.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...m, enabled: !m.enabled }),
    })
    await load()
    toast.success('Guardado correctamente')
  }

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Métodos de envío</h1>
        <button
          onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus size={15} />
          Nuevo método
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {showNew && (
          <div className="px-6 py-4 bg-slate-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Nuevo método de envío</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div>
                <label className={labelCls}>Nombre *</label>
                <input className={inputCls + ' w-full'} value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Tipo</label>
                <select className={inputCls + ' w-full'} value={newForm.type} onChange={e => setNewForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="delivery">Delivery</option>
                  <option value="pickup">Retiro en local</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Precio (Gs.)</label>
                <input type="number" min="0" className={inputCls + ' w-full'} value={newForm.price} onChange={e => setNewForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <input className={inputCls + ' w-full'} value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" checked={newForm.enabled} onChange={e => setNewForm(f => ({ ...f, enabled: e.target.checked }))} className="rounded" />
                Habilitado
              </label>
              <button onClick={createMethod} disabled={saving} className="bg-slate-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-60">
                Crear
              </button>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {methods.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {editId === m.id ? (
                    <input className={inputCls + ' w-full'} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900">{m.name}</p>
                      {m.description && <p className="text-xs text-gray-400">{m.description}</p>}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editId === m.id ? (
                    <select className={inputCls} value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}>
                      <option value="delivery">Delivery</option>
                      <option value="pickup">Retiro en local</option>
                    </select>
                  ) : (
                    <span className="text-gray-600 capitalize">{m.type === 'delivery' ? 'Delivery' : 'Retiro en local'}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editId === m.id ? (
                    <input type="number" min="0" className={inputCls + ' w-28'} value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} />
                  ) : (
                    <span className="text-gray-700 font-medium">{fmtGs(m.price)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleEnabled(m)}>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {m.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editId === m.id ? (
                      <>
                        <button onClick={saveEdit} disabled={saving} className="text-green-600 hover:text-green-700"><Check size={16} /></button>
                        <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(m)} className="text-slate-600 hover:text-slate-800"><Pencil size={14} /></button>
                        <button onClick={() => deleteMethod(m.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {methods.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">Sin métodos de envío.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
