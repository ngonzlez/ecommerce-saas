import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { getSlugFromHost } from '@/lib/tenant'
import { db } from '@/lib/db'

async function getAuthedCustomer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await getAuthedCustomer()
  if (!user) return NextResponse.json([], { status: 200 })

  const headersList = await headers()
  const tenantSlug = getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true } })
  if (!tenant) return NextResponse.json([], { status: 200 })

  const customer = await db.customer.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: user.email! } },
  })
  if (!customer) return NextResponse.json([])

  const favorites = await db.favorite.findMany({
    where: { customerId: customer.id },
    include: { product: { include: { badge: true } } },
  })

  return NextResponse.json(favorites.map((f) => ({
    productId: f.product.id,
    slug: f.product.slug,
    name: f.product.name,
    price: f.product.price,
    comparePrice: f.product.comparePrice,
    image: f.product.images[0] ?? null,
    stock: f.product.stock,
    showStock: f.product.showStock,
    badge: f.product.badge,
  })))
}

export async function POST(req: NextRequest) {
  const user = await getAuthedCustomer()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId requerido' }, { status: 400 })

  const headersList = await headers()
  const tenantSlug = getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true } })
  if (!tenant) return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 })

  const product = await db.product.findFirst({ where: { id: productId, tenantId: tenant.id } })
  if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

  let customer = await db.customer.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: user.email! } },
  })
  if (!customer) {
    customer = await db.customer.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        name: user.user_metadata?.full_name ?? user.email!,
        email: user.email!,
      },
    })
  }

  await db.favorite.upsert({
    where: { customerId_productId: { customerId: customer.id, productId } },
    update: {},
    create: { customerId: customer.id, productId },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthedCustomer()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'productId requerido' }, { status: 400 })

  const headersList = await headers()
  const tenantSlug = getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true } })
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const customer = await db.customer.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: user.email! } },
  })
  if (!customer) return NextResponse.json({ ok: true })

  await db.favorite.deleteMany({ where: { customerId: customer.id, productId } })
  return NextResponse.json({ ok: true })
}
