import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import { db } from '@/lib/db'
import OrderStatusSelect from './OrderStatusSelect'

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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const h = await headers()
  const host = h.get('host') ?? ''
  const slug = getSlugFromHost(host)
  const tenant = await getTenantBySlug(slug)
  if (!tenant) return notFound()

  const order = await db.order.findFirst({
    where: { orderNumber, tenantId: tenant.id },
    include: { items: true, customer: true, shippingMethod: true, coupon: true },
  })
  if (!order) return notFound()

  const clientName = order.customer?.name ?? order.guestName ?? 'Invitado'
  const clientEmail = order.customer?.email ?? order.guestEmail ?? '—'
  const clientPhone = order.customer?.phone ?? order.guestPhone ?? '—'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pedido #{order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString('es-PY', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {statusLabels[order.status] ?? order.status}
          </span>
          <OrderStatusSelect orderNumber={order.orderNumber} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Productos</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-2 text-xs font-medium text-gray-500">Producto</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-500">Cant.</th>
                  <th className="text-right px-6 py-2 text-xs font-medium text-gray-500">Precio unit.</th>
                  <th className="text-right px-6 py-2 text-xs font-medium text-gray-500">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                    <td className="px-6 py-3 text-right text-gray-700">{fmtGs(item.price)}</td>
                    <td className="px-6 py-3 text-right font-medium text-gray-800">{fmtGs(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{fmtGs(order.subtotal)}</span>
              </div>
              {order.shippingPrice > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Envío ({order.shippingMethodName ?? ''})</span>
                  <span>{fmtGs(order.shippingPrice)}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>-{fmtGs(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-2">
                <span>Total</span>
                <span>{fmtGs(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Cliente</h2>
            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-gray-900">{clientName}</p>
              <p className="text-gray-500">{clientEmail}</p>
              <p className="text-gray-500">{clientPhone}</p>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Envío</h2>
            <div className="space-y-1.5 text-sm text-gray-600">
              <p><span className="text-gray-400">Método:</span> {order.shippingMethodName ?? '—'}</p>
              {order.deliveryAddress && <p><span className="text-gray-400">Dirección:</span> {order.deliveryAddress}</p>}
              {order.deliveryCity && <p><span className="text-gray-400">Ciudad:</span> {order.deliveryCity}</p>}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Pago</h2>
            <div className="space-y-1.5 text-sm text-gray-600">
              <p><span className="text-gray-400">Método:</span> <span className="capitalize">{order.paymentMethod}</span></p>
              <p><span className="text-gray-400">Estado:</span> <span className="capitalize">{order.paymentStatus ?? '—'}</span></p>
            </div>
          </div>

          {order.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-2">Notas</h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
