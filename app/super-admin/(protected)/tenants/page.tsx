'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Power, PowerOff, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

type Tenant = {
  id: string
  slug: string
  name: string
  email: string
  suspended: boolean
  customDomain: string | null
  createdAt: string
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/super-admin/tenants')
    const data = await res.json()
    setTenants(data.tenants ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleSuspend(tenant: Tenant) {
    setToggling(tenant.id)
    const res = await fetch(`/api/super-admin/tenants/${tenant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspended: !tenant.suspended }),
    })
    if (res.ok) {
      setTenants((prev) => prev.map((t) => t.id === tenant.id ? { ...t, suspended: !t.suspended } : t))
      toast.success(tenant.suspended ? 'Tenant activado' : 'Tenant suspendido')
    } else {
      toast.error('Error al actualizar')
    }
    setToggling(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Tenants</h2>
          <p className="text-slate-400 text-sm mt-0.5">{tenants.length} tiendas registradas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/super-admin/tenants/new"
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            <Plus size={15} />
            Nuevo tenant
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm py-20 text-center">Cargando...</div>
      ) : tenants.length === 0 ? (
        <div className="text-slate-400 text-sm py-20 text-center">Sin tenants. Creá el primero.</div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Nombre</th>
                <th className="text-left px-5 py-3 font-medium">Slug</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Dominio</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
                <th className="text-left px-5 py-3 font-medium">Creado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-medium text-white">{t.name}</td>
                  <td className="px-5 py-4 text-slate-400 font-mono text-xs">{t.slug}</td>
                  <td className="px-5 py-4 text-slate-400">{t.email}</td>
                  <td className="px-5 py-4 text-slate-400">{t.customDomain ?? <span className="opacity-30">—</span>}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      t.suspended
                        ? 'bg-red-900/50 text-red-400 border border-red-800'
                        : 'bg-emerald-900/50 text-emerald-400 border border-emerald-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${t.suspended ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      {t.suspended ? 'Suspendido' : 'Activo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {new Date(t.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/super-admin/tenants/${t.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        <Pencil size={13} />
                      </Link>
                      <button
                        onClick={() => toggleSuspend(t)}
                        disabled={toggling === t.id}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          t.suspended
                            ? 'text-emerald-400 hover:bg-emerald-900/40'
                            : 'text-red-400 hover:bg-red-900/40'
                        }`}
                        title={t.suspended ? 'Activar' : 'Suspender'}
                      >
                        {t.suspended ? <Power size={13} /> : <PowerOff size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
