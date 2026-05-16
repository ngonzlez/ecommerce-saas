import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { getSlugFromHost } from '@/lib/tenant'

export async function GET(req: NextRequest) {
  const headersList = await headers()
  const tenantSlug = headersList.get('x-tenant-slug') ?? ''
  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } })
  if (!tenant) return NextResponse.json([], { status: 200 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const categorySlug = searchParams.get('categoria') ?? ''
  const onlyOffers = searchParams.get('ofertas') === 'true'

  const category = categorySlug
    ? await db.category.findUnique({ where: { tenantId_slug: { tenantId: tenant.id, slug: categorySlug } } })
    : null

  const products = await db.product.findMany({
    where: {
      tenantId: tenant.id,
      active: true,
      ...(q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
      ...(category ? { categoryId: category.id } : {}),
      ...(onlyOffers ? { NOT: { comparePrice: null } } : {}),
    },
    include: { badge: true, category: true },
    orderBy: { createdAt: 'desc' },
    take: 48,
  })

  return NextResponse.json(products)
}
