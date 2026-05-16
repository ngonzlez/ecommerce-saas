import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { getSlugFromHost } from '@/lib/tenant'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Rate limit: 10 attempts per minute per IP
const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
    })
  : null

export async function POST(req: NextRequest) {
  // Rate limiting
  if (ratelimit) {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)
    if (!success) return NextResponse.json({ error: 'Demasiados intentos' }, { status: 429 })
  }

  const headersList = await headers()
  const tenantSlug = headersList.get('x-tenant-slug') ?? ''
  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } })
  if (!tenant) return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })

  const { code, subtotal } = await req.json()
  if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

  // Validate CSRF origin
  const origin = req.headers.get('origin')
  const host = req.headers.get('host') ?? ''
  if (origin && !origin.includes(host.split(':')[0])) {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 403 })
  }

  const coupon = await db.coupon.findUnique({
    where: { tenantId_code: { tenantId: tenant.id, code: code.toUpperCase() } },
  })

  if (!coupon || !coupon.enabled) {
    return NextResponse.json({ error: 'Cupón inválido o inactivo' }, { status: 400 })
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Cupón vencido' }, { status: 400 })
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: 'Cupón agotado' }, { status: 400 })
  }
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return NextResponse.json(
      { error: `Monto mínimo requerido: ₲${coupon.minOrderAmount.toLocaleString()}` },
      { status: 400 }
    )
  }

  const discount =
    coupon.type === 'percentage'
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value

  return NextResponse.json({ discount, code: coupon.code, type: coupon.type, value: coupon.value })
}
