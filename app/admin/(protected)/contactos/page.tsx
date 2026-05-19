'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check, Phone } from 'lucide-react'
import { toast } from 'sonner'

type ContactNumber = {
  id: string
  title: string
  phone: string
  email: string | null
  order: number
  enabled: boolean
}

const empty = (): Omit<ContactNumber, 'id'> => ({
  title: '',
  phone: '',
  email: '',
  order: 0,
  enabled: true,
})

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

export default function ContactosPage() {
  const [contacts, setContacts] = useState<ContactNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'new' | string | null>(null)
  const [form, setForm] = useState(empty())

  async function load() {
    const res = await fetch('/api/admin/contacts')
    const data = await res.json()
    setContacts(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(empty()); setModal('new') }
  function openEdit(c: ContactNumber) {
    setForm({ title: c.title, phone: c.phone, email: c.email ?? '', order: c.order, enabled: c.enabled })
    setModal(c.id)
  }
  function closeModal() { setModal(null) }

  async function handleSave() {
    const isNew = modal === 'new'
    const body = { ...form, email: form.email || null }
    const res = isNew
      ? await fetch('/api/admin/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch(`/api/admin/contacts/${modal}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

    if (res.ok) {
      toast.success(isNew ? 'Contacto creado' : 'Guardado correctamente')
      closeModal()
      load()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Error al guardar')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este contacto?')) return
    const res = await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Eliminado'); load() }
    else toast.error('Error al eliminar')
  }

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Números de contacto</h1>
          <p className="text-sm text-gray-500 mt-0.5">Aparecen en la página de contacto de la tienda</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
          <Plus size={15} /> Nuevo contacto
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          <Phone size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Sin contactos. Agregá el primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                <Phone size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-slate-700 rounded-lg hover:bg-gray-100"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:underline mt-0.5 block"
                >
                  {c.phone}
                </a>
                {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                {!c.enabled && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full mt-1 inline-block">Inactivo</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">{modal === 'new' ? 'Nuevo contacto' : 'Editar contacto'}</h2>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Título *</label>
                <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Ventas, Soporte, WhatsApp" />
              </div>
              <div>
                <label className={labelCls}>Teléfono *</label>
                <input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0981 123 456" />
              </div>
              <div>
                <label className={labelCls}>Email (opcional)</label>
                <input type="email" className={inputCls} value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ventas@ejemplo.com" />
              </div>
              <div>
                <label className={labelCls}>Orden</label>
                <input type="number" className={inputCls} value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} className="rounded" />
                Activo (visible en la tienda)
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
