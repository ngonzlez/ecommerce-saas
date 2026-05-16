'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useFavoritesStore } from '@/lib/favorites'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const favItems = useFavoritesStore((s) => s.items)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }
    // Sync localStorage favorites → DB
    if (favItems.length > 0) {
      await fetch('/api/favorites/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: favItems.map((i) => i.productId) }),
      }).catch(() => {})
    }
    router.push('/mi-cuenta')
    router.refresh()
  }

  return (
    <main className="pt-14 md:pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border p-8">
          <h1 className="text-xl font-bold mb-1">Iniciar sesión</h1>
          <p className="text-sm text-gray-400 mb-6">Accedé a tu cuenta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
            <input
              type="password"
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-5">
            ¿No tenés cuenta?{' '}
            <Link href="/registro" className="font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
