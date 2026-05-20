import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import { db } from '@/lib/db'
import { User, Package, Heart, LogOut } from 'lucide-react'

export default async function MiCuentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const headersList = await headers()
  const slug = headersList.get('x-tenant-slug') ?? getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await getTenantBySlug(slug)
  if (!tenant) redirect('/')

  const customer = await db.customer.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: user.email! } },
  })

  const orderCount = customer
    ? await db.order.count({ where: { customerId: customer.id } })
    : 0

  const favoriteCount = customer
    ? await db.favorite.count({ where: { customerId: customer.id } })
    : 0

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="bg-white rounded-2xl border p-6 mb-5 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lg">{user.user_metadata?.full_name ?? 'Mi cuenta'}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Link href="/mi-cuenta/pedidos" className="bg-white rounded-2xl border p-5 flex items-center gap-3 hover:shadow-md transition-shadow">
            <Package size={24} style={{ color: 'var(--color-primary)' }} />
            <div>
              <p className="text-2xl font-bold">{orderCount}</p>
              <p className="text-xs text-gray-400">Pedidos</p>
            </div>
          </Link>
          <Link href="/favoritos" className="bg-white rounded-2xl border p-5 flex items-center gap-3 hover:shadow-md transition-shadow">
            <Heart size={24} className="text-red-500" />
            <div>
              <p className="text-2xl font-bold">{favoriteCount}</p>
              <p className="text-xs text-gray-400">Favoritos</p>
            </div>
          </Link>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl border divide-y">
          <Link href="/mi-cuenta/pedidos" className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
            <Package size={20} className="text-gray-400" />
            <span className="text-sm font-medium">Mis pedidos</span>
            <span className="ml-auto text-gray-300">›</span>
          </Link>
          <Link href="/mi-cuenta/editar" className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
            <User size={20} className="text-gray-400" />
            <span className="text-sm font-medium">Editar perfil</span>
            <span className="ml-auto text-gray-300">›</span>
          </Link>
          <Link href="/favoritos" className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
            <Heart size={20} className="text-gray-400" />
            <span className="text-sm font-medium">Mis favoritos</span>
            <span className="ml-auto text-gray-300">›</span>
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition-colors text-red-500">
              <LogOut size={20} />
              <span className="text-sm font-medium">Cerrar sesión</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
