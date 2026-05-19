'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface PaymentMethod {
  id?: string
  type: string
  label: string
  details: string
  enabled: boolean
  order: number
}

const DEFAULTS: PaymentMethod[] = [
  { type: 'efectivo', label: 'Efectivo', details: '', enabled: false, order: 0 },
  { type: 'transferencia', label: 'Transferencia bancaria', details: '', enabled: false, order: 1 },
  { type: 'tarjeta', label: 'Tarjeta de crédito/débito', details: '', enabled: false, order: 2 },
  { type: 'pagopar', label: 'PagoPar', details: '', enabled: false, order: 3 },
  { type: 'mercadopago', label: 'MercadoPago', details: '', enabled: false, order: 4 },
]

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400'

export default function PagosPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/payment').then(r => r.json()).then((data: PaymentMethod[]) => {
      const merged = DEFAULTS.map(def => {
        const existing = data.find(d => d.type === def.type)
        return existing ? { ...def, ...existing } : def
      })
      setMethods(merged)
      setLoading(false)
    })
  }, [])

  function update(type: string, field: keyof PaymentMethod, value: string | boolean | number) {
    setMethods(prev => prev.map(m => m.type === type ? { ...m, [field]: value } : m))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/admin/payment', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(methods),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      toast.error(d.error ?? 'Error al guardar')
    } else {
      setSaved(true)
      toast.success('Guardado correctamente')
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Métodos de pago</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-800 text-white text-sm px-5 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
        </button>
      </div>

      <div className="space-y-4">
        {methods.map((m) => (
          <div key={m.type} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-gray-800">{m.label}</h2>
                <p className="text-xs text-gray-400 font-mono">{m.type}</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={m.enabled}
                  onChange={e => update(m.type, 'enabled', e.target.checked)}
                  className="rounded"
                />
                <span className={`text-sm font-medium ${m.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {m.enabled ? 'Habilitado' : 'Deshabilitado'}
                </span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label personalizado</label>
              <input
                className={inputCls + ' mb-3'}
                value={m.label}
                onChange={e => update(m.type, 'label', e.target.value)}
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Detalles / Instrucciones</label>
              <textarea
                className={inputCls + ' resize-y min-h-[80px]'}
                value={m.details}
                onChange={e => update(m.type, 'details', e.target.value)}
                placeholder="Ej: Número de cuenta, alias, instrucciones de pago..."
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-800 text-white text-sm px-5 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
