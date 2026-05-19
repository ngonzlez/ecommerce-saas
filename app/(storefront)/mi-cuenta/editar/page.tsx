'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

const inputCls = 'w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

export default function EditarPerfilPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/account/profile')
      .then(r => r.json())
      .then(d => {
        setForm({ name: d.name ?? '', phone: d.phone ?? '', address: d.address ?? '' })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Perfil actualizado')
      router.push('/mi-cuenta')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="pt-6 min-h-screen bg-gray-50" />

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/mi-cuenta" className="text-gray-400 hover:text-gray-700">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold">Editar perfil</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-6 space-y-4">
          <div>
            <label className={labelCls}>Nombre completo</label>
            <input
              className={inputCls}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Teléfono</label>
            <input
              type="tel"
              className={inputCls}
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Dirección</label>
            <input
              className={inputCls}
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Link href="/mi-cuenta" className="flex-1 text-center border rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
