'use client'

import { useState } from 'react'
import { toast } from 'sonner'

const statuses = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'processing', label: 'En proceso' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export default function OrderStatusSelect({
  orderNumber,
  currentStatus,
}: {
  orderNumber: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)

  async function handleChange(newStatus: string) {
    setSaving(true)
    await fetch(`/api/admin/orders/${orderNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setStatus(newStatus)
    toast.success('Estado actualizado')
    setSaving(false)
  }

  return (
    <select
      value={status}
      onChange={e => handleChange(e.target.value)}
      disabled={saving}
      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60"
    >
      {statuses.map(s => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  )
}
