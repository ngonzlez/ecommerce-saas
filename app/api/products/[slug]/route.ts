import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getSlugFromHost } from '@/lib/tenant'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const headersList = await headers()
  const tenantSlug = getSlugFromHost(headersList.get('host') ?? '')

  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true } })
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const product = await db.product.findFirst({
    where: { slug, tenantId: tenant.id, active: true },
    include: {
      badge: true,
      category: { select: { name: true, slug: true } },
      variantGroups: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
    },
  })

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    comparePrice: product.comparePrice,
    stock: product.stock,
    showStock: product.showStock,
    trackStock: product.trackStock,
    images: product.images,
    category: product.category,
    badge: product.badge
      ? { text: product.badge.text, color: product.badge.color, type: product.badge.type }
      : null,
    variantGroups: product.variantGroups.map(g => ({
      id: g.id,
      name: g.name,
      required: g.required,
      options: g.options.map(o => ({ id: o.id, name: o.name })),
    })),
  })
}
