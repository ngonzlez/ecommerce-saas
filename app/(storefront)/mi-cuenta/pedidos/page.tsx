import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getTenantBySlug, getSlugFromHost, formatPrice } from '@/lib/tenant'
import { db } from '@/lib/db'
import { Package } from 'lucide-react'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default async function MisPedidosPage() {
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

  const orders = customer
    ? await db.order.findMany({
        where: { customerId: customer.id, tenantId: tenant.id },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    : []

  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Package size={48} className="text-gray-200" />
        <p className="text-gray-400">Todavía no hiciste ningún pedido</p>
        <Link href="/productos" className="text-sm font-medium underline" style={{ color: 'var(--color-primary)' }}>
          Ir a la tienda
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/mi-cuenta" className="text-gray-400 hover:text-gray-700 text-sm">← Mi cuenta</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold">Mis pedidos</h1>
        </div>

        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/mi-cuenta/pedidos/${order.orderNumber}`}
              className="bg-white rounded-2xl border p-5 flex items-center justify-between hover:shadow-md transition-shadow block"
            >
              <div>
                <p className="font-semibold text-sm">{order.orderNumber}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {' · '}{order.items.length} {order.items.length === 1 ? 'ítem' : 'ítems'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-sm">{formatPrice(order.total)}</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
                <span className="text-gray-300">›</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
