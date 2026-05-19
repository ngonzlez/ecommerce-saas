'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20'
const labelCls = 'block text-sm font-medium text-slate-300 mb-1.5'

export default function EditTenantPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState({ name: '', email: '', customDomain: '', suspended: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    fetch(`/api/super-admin/tenants/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setForm({ name: d.name ?? '', email: d.email ?? '', customDomain: d.customDomain ?? '', suspended: d.suspended ?? false })
        setLoading(false)
      })
  }, [id])

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/super-admin/tenants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Tenant actualizado')
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Error al guardar')
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const res = await fetch(`/api/super-admin/tenants/${id}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) {
      toast.success('Tenant eliminado')
      router.push('/super-admin/tenants')
    } else {
      toast.error('Error al eliminar')
      setConfirmDelete(false)
    }
  }

  if (loading) return <div className="text-slate-400 text-sm">Cargando...</div>

  return (
    <div className="max-w-lg">
      <Link href="/super-admin/tenants" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Volver
      </Link>
      <h2 className="text-2xl font-bold mb-8">Editar tenant</h2>

      <form onSubmit={handleSave} className="space-y-5 bg-slate-900 rounded-xl border border-slate-800 p-6">
        <div>
          <label className={labelCls}>Nombre del comercio</label>
          <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>

        <div>
          <label className={labelCls}>Email del administrador</label>
          <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
        </div>

        <div>
          <label className={labelCls}>Dominio personalizado <span className="text-slate-500 font-normal">(opcional)</span></label>
          <input className={inputCls} value={form.customDomain} onChange={(e) => set('customDomain', e.target.value)} placeholder="tienda.com" />
        </div>

        <div className="flex items-center justify-between py-2 border-t border-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-300">Suspender tenant</p>
            <p className="text-xs text-slate-500 mt-0.5">La tienda quedará inaccesible para los clientes</p>
          </div>
          <button
            type="button"
            onClick={() => set('suspended', !form.suspended)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.suspended ? 'bg-red-600' : 'bg-slate-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.suspended ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-white text-slate-900 text-sm font-semibold py-2.5 rounded-lg hover:bg-slate-100 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <Link
            href="/super-admin/tenants"
            className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>

      {/* Delete zone */}
      <div className="mt-6 bg-red-950/30 rounded-xl border border-red-900/50 p-5">
        <h3 className="text-sm font-semibold text-red-400 mb-1">Zona peligrosa</h3>
        <p className="text-xs text-slate-400 mb-4">Eliminar el tenant borra todos sus datos permanentemente.</p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/50 text-red-300 border border-red-800 text-sm font-medium hover:bg-red-900 transition-colors disabled:opacity-50"
        >
          <Trash2 size={13} />
          {confirmDelete ? (deleting ? 'Eliminando...' : 'Confirmar eliminación') : 'Eliminar tenant'}
        </button>
        {confirmDelete && !deleting && (
          <p className="text-xs text-red-400 mt-2">Hacé clic de nuevo para confirmar. Esta acción no se puede deshacer.</p>
        )}
      </div>
    </div>
  )
}
