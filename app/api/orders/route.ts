import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '1 m'),
    })
  : null

function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export async function POST(req: NextRequest) {
  // Rate limiting
  if (ratelimit) {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)
    if (!success) return NextResponse.json({ error: 'Demasiados intentos' }, { status: 429 })
  }

  // CSRF check
  const origin = req.headers.get('origin')
  const host = req.headers.get('host') ?? ''
  if (origin && !origin.includes(host.split(':')[0])) {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 403 })
  }

  const headersList = await headers()
  const tenantSlug = headersList.get('x-tenant-slug') ?? ''
  const tenant = await db.tenant.findUnique({
    where: { slug: tenantSlug },
    include: { paymentMethods: { where: { enabled: true } }, shippingMethods: true },
  })
  if (!tenant) return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })

  const body = await req.json()
  const {
    items, // [{ productId, quantity }]
    guestName, guestEmail, guestPhone,
    deliveryAddress, deliveryCity, billingAddress, rucCi,
    shippingMethodId,
    paymentMethod,
    couponCode,
    notes,
  } = body

  if (!items?.length || !guestEmail || !guestName || !shippingMethodId || !paymentMethod) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  // Fetch products from DB — NEVER trust frontend prices
  const productIds = items.map((i: { productId: string }) => i.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds }, tenantId: tenant.id, active: true },
  })

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'Uno o más productos no disponibles' }, { status: 400 })
  }

  // Calculate subtotal from DB prices
  let subtotal = 0
  const orderItems = items.map((item: { productId: string; quantity: number }) => {
    const product = products.find((p) => p.id === item.productId)!
    if (product.stock < item.quantity) throw new Error(`Stock insuficiente: ${product.name}`)
    subtotal += product.price * item.quantity
    return {
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] ?? null,
      quantity: item.quantity,
      price: product.price,
    }
  })

  // Validate shipping method belongs to this tenant
  const shippingMethod = tenant.shippingMethods.find(
    (s) => s.id === shippingMethodId && s.enabled
  )
  if (!shippingMethod) {
    return NextResponse.json({ error: 'Método de envío inválido' }, { status: 400 })
  }

  // Apply coupon atomically
  let discountAmount = 0
  let couponId: string | null = null
  if (couponCode) {
    const coupon = await db.coupon.findUnique({
      where: { tenantId_code: { tenantId: tenant.id, code: couponCode.toUpperCase() } },
    })
    if (
      coupon &&
      coupon.enabled &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
      (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount)
    ) {
      discountAmount =
        coupon.type === 'percentage'
          ? Math.round((subtotal * coupon.value) / 100)
          : coupon.value
      couponId = coupon.id
    }
  }

  const total = Math.max(0, subtotal - discountAmount + shippingMethod.price)

  // Create order + decrement stock + increment coupon usage in a transaction
  const order = await db.$transaction(async (tx) => {
    // Decrement stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    // Increment coupon usage atomically
    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      })
    }

    return tx.order.create({
      data: {
        tenantId: tenant.id,
        orderNumber: generateOrderNumber(),
        guestName,
        guestEmail,
        guestPhone,
        shippingMethodId,
        shippingMethodName: shippingMethod.name,
        shippingPrice: shippingMethod.price,
        deliveryAddress,
        deliveryCity,
        billingAddress,
        rucCi,
        paymentMethod,
        couponId,
        couponCode: couponCode?.toUpperCase() ?? null,
        discountAmount,
        subtotal,
        total,
        notes,
        items: { create: orderItems },
      },
    })
  })

  // Send emails (async, non-blocking)
  try {
    const { sendOrderEmails } = await import('@/lib/email/send')
    await sendOrderEmails({ order, tenant, items: orderItems, shippingMethod })
  } catch (e) {
    console.error('Email send failed:', e)
  }

  return NextResponse.json({ orderNumber: order.orderNumber }, { status: 201 })
}
