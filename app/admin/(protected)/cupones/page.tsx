'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

interface Coupon {
  id: string
  code: string
  type: string
  value: number
  minOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  enabled: boolean
}

function fmtGs(v: number) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0,
  }).format(v)
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

function emptyForm() {
  return {
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxUses: '',
    expiresAt: '',
    enabled: true,
  }
}

export default function CuponesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'new' | string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/admin/coupons')
    const data = await res.json()
    setCoupons(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setForm(emptyForm())
    setModal('new')
    setError('')
  }

  function openEdit(c: Coupon) {
    setForm({
      code: c.code,
      type: c.type,
      value: c.value.toString(),
      minOrderAmount: c.minOrderAmount?.toString() ?? '',
      maxUses: c.maxUses?.toString() ?? '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      enabled: c.enabled,
    })
    setModal(c.id)
    setError('')
  }

  async function save() {
    setSaving(true)
    setError('')
    const body = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      enabled: form.enabled,
    }
    const res = modal === 'new'
      ? await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch(`/api/admin/coupons/${modal}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Error al guardar')
      toast.error(d.error ?? 'Error al guardar')
    } else {
      setModal(null)
      await load()
      toast.success(modal === 'new' ? 'Cupón creado' : 'Guardado correctamente')
    }
    setSaving(false)
  }

  async function deleteCoupon(id: string) {
    if (!confirm('¿Eliminar este cupón?')) return
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    await load()
    toast.success('Eliminado')
  }

  async function toggleEnabled(c: Coupon) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, enabled: !c.enabled }),
    })
    await load()
    toast.success('Guardado correctamente')
  }

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Cupones</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus size={15} />
          Nuevo cupón
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Usos</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vence</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-semibold text-gray-800">{c.code}</td>
                <td className="px-4 py-3 text-gray-600">
                  {c.type === 'percentage' ? 'Porcentaje' : 'Monto fijo'}
                </td>
                <td className="px-4 py-3 text-gray-800">
                  {c.type === 'percentage' ? `${c.value}%` : fmtGs(c.value)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('es-PY') : 'Sin vencimiento'}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleEnabled(c)}>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${c.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(c)} className="text-slate-600 hover:text-slate-800">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteCoupon(c.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">Sin cupones aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">{modal === 'new' ? 'Nuevo cupón' : 'Editar cupón'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Código *</label>
                <input className={inputCls} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="DESCUENTO20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Tipo</label>
                  <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="percentage">Porcentaje</option>
                    <option value="fixed">Monto fijo</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Valor *</label>
                  <input type="number" min="0" className={inputCls} value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Máx. usos</label>
                  <input type="number" min="0" className={inputCls} value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Monto mínimo</label>
                  <input type="number" min="0" className={inputCls} value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Fecha de vencimiento</label>
                <input type="date" className={inputCls} value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-700">Cupón activo</span>
              </label>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
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
