import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantBySlug, getSlugFromHost, formatPrice } from '@/lib/tenant'
import { db } from '@/lib/db'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

type Props = { params: Promise<{ orderNumber: string }> }

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = await params
  const headersList = await headers()
  const slug = headersList.get('x-tenant-slug') ?? getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const order = await db.order.findFirst({
    where: { orderNumber, tenantId: tenant.id },
    include: { items: true, shippingMethod: true, coupon: true },
  })
  if (!order) notFound()

  const paymentMethod = tenant.paymentMethods.find((p) => p.label === order.paymentMethod)

  return (
    <main className="pt-6 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border p-6 space-y-6">
          <div className="text-center">
            <CheckCircle2 size={52} className="mx-auto text-green-500 mb-3" />
            <h1 className="text-xl font-bold">¡Pedido recibido!</h1>
            <p className="text-gray-500 text-sm mt-1">Número de pedido: <strong>{order.orderNumber}</strong></p>
            {order.guestEmail && (
              <p className="text-xs text-gray-400 mt-1">Enviamos la confirmación a {order.guestEmail}</p>
            )}
          </div>

          {/* Items */}
          <div className="border rounded-xl overflow-hidden">
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center px-4 py-3 text-sm">
                  <span className="font-medium">{item.productName} <span className="text-gray-400">×{item.quantity}</span></span>
                  <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 px-4 py-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600"><span>Descuento ({order.couponCode})</span><span>-{formatPrice(order.discountAmount)}</span></div>
              )}
              <div className="flex justify-between">
                <span>Envío ({order.shippingMethodName})</span>
                <span>{order.shippingPrice === 0 ? 'GRATIS' : formatPrice(order.shippingPrice)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping info */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <p><strong>Método de envío:</strong> {order.shippingMethodName}</p>
            {order.deliveryAddress && <p><strong>Dirección:</strong> {order.deliveryAddress}{order.deliveryCity ? `, ${order.deliveryCity}` : ''}</p>}
          </div>

          {/* Payment instructions */}
          {paymentMethod?.details && (
            <div className="bg-blue-50 rounded-xl p-4 text-sm">
              <p className="font-semibold mb-2">Instrucciones de pago — {paymentMethod.label}</p>
              <p className="whitespace-pre-line text-gray-700">{paymentMethod.details}</p>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/productos"
              className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
