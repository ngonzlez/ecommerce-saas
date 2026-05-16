'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function RegistroPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function setField(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 8) { setError('Contraseña mínimo 8 caracteres'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (authError) { setError(authError.message); setLoading(false); return }
    router.push('/registro/confirmar')
  }

  return (
    <main className="pt-14 md:pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border p-8">
          <h1 className="text-xl font-bold mb-1">Crear cuenta</h1>
          <p className="text-sm text-gray-400 mb-6">Registrate para guardar favoritos y ver tus pedidos</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              placeholder="Nombre completo"
              required
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
            <input
              type="password"
              placeholder="Contraseña (mín. 8 caracteres)"
              required
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              required
              value={form.confirm}
              onChange={(e) => setField('confirm', e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-5">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
