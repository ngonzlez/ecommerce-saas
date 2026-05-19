'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20'
const labelCls = 'block text-sm font-medium text-slate-300 mb-1.5'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function NewTenantPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', slug: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set(field: string, value: string) {
    setForm((f) => {
      const next = { ...f, [field]: value }
      if (field === 'name' && !f.slug) next.slug = slugify(value)
      return next
    })
    setErrors((e) => { const n = { ...e }; delete n[field]; return n })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Requerido'
    if (!form.slug.trim()) errs.slug = 'Requerido'
    if (!form.email.trim()) errs.email = 'Requerido'
    if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    const res = await fetch('/api/super-admin/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      toast.error(data.error ?? 'Error al crear tenant')
      if (data.field) setErrors({ [data.field]: data.error })
    } else {
      toast.success(`Tenant "${form.name}" creado`)
      router.push('/super-admin/tenants')
    }
  }

  return (
    <div className="max-w-lg">
      <Link href="/super-admin/tenants" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Volver
      </Link>
      <h2 className="text-2xl font-bold mb-8">Nuevo tenant</h2>

      <form onSubmit={handleSubmit} className="space-y-5 bg-slate-900 rounded-xl border border-slate-800 p-6">
        <div>
          <label className={labelCls}>Nombre del comercio</label>
          <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Mi Tienda" />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className={labelCls}>Slug <span className="text-slate-500 font-normal">(subdominio)</span></label>
          <div className="flex items-center gap-0">
            <input
              className={inputCls + ' rounded-r-none border-r-0'}
              value={form.slug}
              onChange={(e) => set('slug', slugify(e.target.value))}
              placeholder="mi-tienda"
            />
            <span className="bg-slate-700 border border-slate-700 rounded-r-lg px-3 py-2.5 text-slate-400 text-sm whitespace-nowrap">.tuapp.com</span>
          </div>
          {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug}</p>}
        </div>

        <div>
          <label className={labelCls}>Email del administrador</label>
          <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="admin@mtienda.com" />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className={labelCls}>Contraseña inicial</label>
          <div className="relative">
            <input
              className={inputCls + ' pr-10'}
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-white text-slate-900 text-sm font-semibold py-2.5 rounded-lg hover:bg-slate-100 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Creando...' : 'Crear tenant'}
          </button>
          <Link
            href="/super-admin/tenants"
            className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
