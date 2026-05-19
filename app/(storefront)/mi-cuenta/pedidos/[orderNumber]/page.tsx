import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getTenantBySlug, getSlugFromHost, formatPrice } from '@/lib/tenant'
import { db } from '@/lib/db'
import { CheckCircle2, Clock, Truck, Package } from 'lucide-react'

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered']
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
}
const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={18} />, confirmed: <CheckCircle2 size={18} />,
  shipped: <Truck size={18} />, delivered: <Package size={18} />,
}

type Props = { params: Promise<{ orderNumber: string }> }

export default async function MiPedidoPage({ params }: Props) {
  const { orderNumber } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const headersList = await headers()
  const slug = getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await getTenantBySlug(slug)
  if (!tenant) redirect('/')

  const customer = await db.customer.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: user.email! } },
  })
  if (!customer) notFound()

  const order = await db.order.findFirst({
    where: { orderNumber, tenantId: tenant.id, customerId: customer.id },
    include: { items: true },
  })
  if (!order) notFound()

  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/mi-cuenta/pedidos" className="text-gray-400 hover:text-gray-700 text-sm">← Mis pedidos</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-mono font-semibold">{order.orderNumber}</span>
        </div>

        {/* Status tracker */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-2xl border p-6 mb-5">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${i <= currentStep ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                    style={i <= currentStep ? { backgroundColor: 'var(--color-primary)' } : {}}
                  >
                    {STATUS_ICONS[step]}
                  </div>
                  <span className={`text-xs text-center ${i <= currentStep ? 'font-semibold' : 'text-gray-400'}`}>
                    {STATUS_LABEL[step]}
                  </span>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`absolute hidden`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl border overflow-hidden mb-5">
          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center px-5 py-4 text-sm">
                <span className="font-medium">{item.productName} <span className="text-gray-400">×{item.quantity}</span></span>
                <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 px-5 py-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600"><span>Descuento ({order.couponCode})</span><span>-{formatPrice(order.discountAmount)}</span></div>
            )}
            <div className="flex justify-between">
              <span>Envío</span>
              <span>{order.shippingPrice === 0 ? 'GRATIS' : formatPrice(order.shippingPrice)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl border p-5 text-sm space-y-2">
          <p><strong>Envío:</strong> {order.shippingMethodName}</p>
          {order.deliveryAddress && <p><strong>Dirección:</strong> {order.deliveryAddress}{order.deliveryCity ? `, ${order.deliveryCity}` : ''}</p>}
          <p><strong>Pago:</strong> {order.paymentMethod}</p>
          {order.notes && <p><strong>Notas:</strong> {order.notes}</p>}
        </div>
      </div>
    </main>
  )
}
