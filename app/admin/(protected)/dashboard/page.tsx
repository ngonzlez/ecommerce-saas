import { headers } from 'next/headers'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import { db } from '@/lib/db'
import { LayoutDashboard, ShoppingBag, Package, Clock } from 'lucide-react'

function fmtGs(v: number) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0,
  }).format(v)
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export default async function DashboardPage() {
  const h = await headers()
  const host = h.get('host') ?? ''
  const slug = getSlugFromHost(host)
  const tenant = await getTenantBySlug(slug)
  if (!tenant) return null

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalOrders,
    monthOrders,
    revenueAgg,
    monthRevenueAgg,
    totalProducts,
    pendingOrders,
    lastOrders,
  ] = await Promise.all([
    db.order.count({ where: { tenantId: tenant.id } }),
    db.order.count({ where: { tenantId: tenant.id, createdAt: { gte: startOfMonth } } }),
    db.order.aggregate({
      where: { tenantId: tenant.id, status: { not: 'cancelled' } },
      _sum: { total: true },
    }),
    db.order.aggregate({
      where: { tenantId: tenant.id, status: { not: 'cancelled' }, createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    db.product.count({ where: { tenantId: tenant.id, active: true } }),
    db.order.count({ where: { tenantId: tenant.id, status: 'pending' } }),
    db.order.findMany({
      where: { tenantId: tenant.id },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const totalRevenue = revenueAgg._sum.total ?? 0
  const monthRevenue = monthRevenueAgg._sum.total ?? 0

  const stats = [
    {
      label: 'Pedidos totales',
      value: totalOrders.toString(),
      sub: `${monthOrders} este mes`,
      icon: ShoppingBag,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Ingresos totales',
      value: fmtGs(totalRevenue),
      sub: `${fmtGs(monthRevenue)} este mes`,
      icon: LayoutDashboard,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Productos activos',
      value: totalProducts.toString(),
      sub: 'en catálogo',
      icon: Package,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Pedidos pendientes',
      value: pendingOrders.toString(),
      sub: 'requieren atención',
      icon: Clock,
      color: 'text-orange-600 bg-orange-50',
    },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{s.label}</span>
                <span className={`p-2 rounded-lg ${s.color}`}>
                  <Icon size={16} />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Last orders table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Últimos pedidos</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lastOrders.map((order) => {
              const clientName = order.customer?.name ?? order.guestName ?? 'Invitado'
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-gray-600">{order.orderNumber}</td>
                  <td className="px-6 py-3 text-gray-800">{clientName}</td>
                  <td className="px-6 py-3 text-gray-800 font-medium">{fmtGs(order.total)}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('es-PY')}
                  </td>
                </tr>
              )
            })}
            {lastOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                  Sin pedidos aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
