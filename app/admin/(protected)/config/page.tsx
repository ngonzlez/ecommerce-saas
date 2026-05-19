'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface StoreConfig {
  name: string
  email: string
  whatsappNumber: string
  address: string
  customDomain: string
  requireRegistration: boolean
  allowGuestCheckout: boolean
  whatsappFloatingButton: boolean
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

export default function ConfigPage() {
  const [form, setForm] = useState<StoreConfig>({
    name: '',
    email: '',
    whatsappNumber: '',
    address: '',
    customDomain: '',
    requireRegistration: false,
    allowGuestCheckout: true,
    whatsappFloatingButton: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/config').then(r => r.json()).then(data => {
      setForm(prev => ({
        ...prev,
        name: data.name ?? prev.name,
        email: data.email ?? prev.email,
        whatsappNumber: data.whatsappNumber ?? prev.whatsappNumber,
        address: data.address ?? prev.address,
        requireRegistration: data.requireRegistration ?? prev.requireRegistration,
        allowGuestCheckout: data.allowGuestCheckout ?? prev.allowGuestCheckout,
        customDomain: data.customDomain ?? '',
        whatsappFloatingButton: data.whatsappFloatingButton ?? prev.whatsappFloatingButton,
      }))
      setLoading(false)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Error al guardar')
      toast.error(d.error ?? 'Error al guardar')
    } else {
      setSaved(true)
      toast.success('Guardado correctamente')
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Store info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Información de la tienda</h2>
            <div>
              <label className={labelCls}>Nombre de la tienda</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Mi Tienda"
              />
            </div>
            <div>
              <label className={labelCls}>Email de notificaciones</label>
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="notificaciones@tienda.com"
              />
            </div>
            <div>
              <label className={labelCls}>Número WhatsApp</label>
              <input
                className={inputCls}
                value={form.whatsappNumber}
                onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))}
                placeholder="595XXXXXXXXX"
              />
              <p className="text-xs text-gray-400 mt-1">Formato internacional sin + (ej: 595981234567)</p>
            </div>
            <div>
              <label className={labelCls}>Dirección</label>
              <input
                className={inputCls}
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Av. Ejemplo 123, Asunción"
              />
            </div>
            <div>
              <label className={labelCls}>Dominio propio (opcional)</label>
              <input
                className={inputCls}
                value={form.customDomain}
                onChange={e => setForm(f => ({ ...f, customDomain: e.target.value.toLowerCase().trim() }))}
                placeholder="mitienda.com"
              />
              <p className="text-xs text-gray-400 mt-1">
                Sin https:// ni www. El cliente debe apuntar su DNS a este servidor.
              </p>
            </div>
          </div>

          {/* Toggles */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-5">Opciones de compra</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <label className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={form.requireRegistration}
                    onChange={e => setForm(f => ({ ...f, requireRegistration: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-checked:bg-slate-700 rounded-full transition-colors relative cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                </label>
                <div>
                  <p className="text-sm font-medium text-gray-800">Requerir registro para comprar</p>
                  <p className="text-xs text-gray-400">Los clientes deben tener cuenta para comprar</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <label className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={form.allowGuestCheckout}
                    onChange={e => setForm(f => ({ ...f, allowGuestCheckout: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-checked:bg-slate-700 rounded-full transition-colors relative cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                </label>
                <div>
                  <p className="text-sm font-medium text-gray-800">Permitir checkout como invitado</p>
                  <p className="text-xs text-gray-400">Los clientes pueden comprar sin registrarse</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <label className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={form.whatsappFloatingButton}
                    onChange={e => setForm(f => ({ ...f, whatsappFloatingButton: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-checked:bg-slate-700 rounded-full transition-colors relative cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                </label>
                <div>
                  <p className="text-sm font-medium text-gray-800">Botón flotante de WhatsApp</p>
                  <p className="text-xs text-gray-400">Muestra un botón flotante de WhatsApp en la tienda</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-slate-800 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
