'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface MarqueeItem {
  id: string
  text: string
  order: number
  enabled: boolean
}

const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400'

export default function MarqueePage() {
  const [items, setItems] = useState<MarqueeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [newText, setNewText] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/marquee')
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addItem() {
    if (!newText.trim()) return
    setSaving(true)
    await fetch('/api/admin/marquee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText.trim(), order: items.length, enabled: true }),
    })
    setNewText('')
    await load()
    toast.success('Texto agregado')
    setSaving(false)
  }

  async function saveEdit() {
    if (!editId) return
    setSaving(true)
    await fetch(`/api/admin/marquee/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editText }),
    })
    setEditId(null)
    await load()
    toast.success('Guardado correctamente')
    setSaving(false)
  }

  async function deleteItem(id: string) {
    if (!confirm('¿Eliminar este texto?')) return
    await fetch(`/api/admin/marquee/${id}`, { method: 'DELETE' })
    await load()
    toast.success('Eliminado')
  }

  async function toggleEnabled(item: MarqueeItem) {
    await fetch(`/api/admin/marquee/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, enabled: !item.enabled }),
    })
    await load()
    toast.success('Guardado correctamente')
  }

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Marquee (textos deslizantes)</h1>

      {/* Add new */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <p className="text-sm font-medium text-gray-700 mb-3">Agregar nuevo texto</p>
        <div className="flex gap-2">
          <input
            className={inputCls + ' flex-1'}
            placeholder="Ej: ¡Envío gratis a partir de Gs. 100.000!"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
          />
          <button
            onClick={addItem}
            disabled={saving || !newText.trim()}
            className="flex items-center gap-2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors"
          >
            <Plus size={14} />
            Agregar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Texto</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 flex-1">
                  {editId === item.id ? (
                    <input
                      className={inputCls + ' w-full'}
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEdit()}
                    />
                  ) : (
                    <span className="text-gray-800">{item.text}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleEnabled(item)}>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${item.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editId === item.id ? (
                      <>
                        <button onClick={saveEdit} disabled={saving} className="text-green-600 hover:text-green-700"><Check size={16} /></button>
                        <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(item.id); setEditText(item.text) }} className="text-slate-600 hover:text-slate-800"><Pencil size={14} /></button>
                        <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-gray-400 text-sm">Sin textos de marquee aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
