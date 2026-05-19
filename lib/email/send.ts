import { Resend } from 'resend'
import { formatPrice } from '@/lib/tenant'

const resend = new Resend(process.env.RESEND_API_KEY)

type OrderItem = {
  productName: string
  productImage: string | null
  quantity: number
  price: number
}

type Params = {
  order: {
    orderNumber: string
    guestName: string | null
    guestEmail: string | null
    guestPhone: string | null
    shippingMethodName: string | null
    shippingPrice: number
    paymentMethod: string | null
    couponCode: string | null
    discountAmount: number
    subtotal: number
    total: number
    deliveryAddress: string | null
    deliveryCity: string | null
    notes: string | null
  }
  tenant: {
    name: string
    email: string
    whatsappNumber: string | null
  }
  items: OrderItem[]
  shippingMethod: { name: string; price: number; type: string }
}

function orderSummaryHtml(items: OrderItem[], order: Params['order']): string {
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${i.productName}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(i.price * i.quantity)}</td>
      </tr>`
    )
    .join('')

  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead>
        <tr style="background:#f5f5f5">
          <th style="padding:8px;text-align:left">Producto</th>
          <th style="padding:8px;text-align:center">Cant.</th>
          <th style="padding:8px;text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr><td colspan="2" style="padding:8px;text-align:right">Subtotal</td><td style="padding:8px;text-align:right">${formatPrice(order.subtotal)}</td></tr>
        ${order.discountAmount > 0 ? `<tr><td colspan="2" style="padding:8px;text-align:right;color:#16a34a">Descuento (${order.couponCode})</td><td style="padding:8px;text-align:right;color:#16a34a">-${formatPrice(order.discountAmount)}</td></tr>` : ''}
        <tr><td colspan="2" style="padding:8px;text-align:right">Envío (${order.shippingMethodName})</td><td style="padding:8px;text-align:right">${order.shippingPrice === 0 ? 'GRATIS' : formatPrice(order.shippingPrice)}</td></tr>
        <tr style="font-weight:bold;font-size:1.1em"><td colspan="2" style="padding:8px;text-align:right">TOTAL</td><td style="padding:8px;text-align:right">${formatPrice(order.total)}</td></tr>
      </tfoot>
    </table>
  `
}

export async function sendOrderEmails({ order, tenant, items, shippingMethod }: Params) {
  if (!process.env.RESEND_API_KEY) return

  const clientName = order.guestName ?? 'Cliente'
  const summary = orderSummaryHtml(items, order)

  // Email al cliente
  await resend.emails.send({
    from: `${tenant.name} <noreply@tuapp.com>`,
    to: order.guestEmail ?? '',
    subject: `Pedido confirmado #${order.orderNumber} — ${tenant.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Hola ${clientName}, tu pedido fue recibido</h2>
        <p><strong>Número de pedido:</strong> ${order.orderNumber}</p>
        ${summary}
        <p><strong>Método de envío:</strong> ${order.shippingMethodName}</p>
        ${order.deliveryAddress ? `<p><strong>Dirección de entrega:</strong> ${order.deliveryAddress}, ${order.deliveryCity ?? ''}</p>` : ''}
        <p><strong>Método de pago:</strong> ${order.paymentMethod}</p>
        ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ''}
        <hr/>
        <p style="color:#666;font-size:0.9em">¿Consultas? Contactanos por WhatsApp${tenant.whatsappNumber ? ` al ${tenant.whatsappNumber}` : ''} o a ${tenant.email}</p>
      </div>
    `,
  })

  // Email al comercio
  await resend.emails.send({
    from: `Sistema <noreply@tuapp.com>`,
    to: tenant.email,
    subject: `Nuevo pedido #${order.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Nuevo pedido recibido</h2>
        <p><strong>Número:</strong> ${order.orderNumber}</p>
        <p><strong>Cliente:</strong> ${clientName} — ${order.guestEmail}</p>
        ${order.guestPhone ? `<p><strong>Teléfono:</strong> ${order.guestPhone}</p>` : ''}
        ${summary}
        <p><strong>Envío:</strong> ${order.shippingMethodName} — ${shippingMethod.type === 'delivery' ? `${order.deliveryAddress}, ${order.deliveryCity}` : 'Retiro en local'}</p>
        <p><strong>Pago:</strong> ${order.paymentMethod}</p>
        ${order.notes ? `<p><strong>Notas del cliente:</strong> ${order.notes}</p>` : ''}
      </div>
    `,
  })
}
