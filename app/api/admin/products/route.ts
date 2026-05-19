import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase-server'

async function getAdminTenant(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const host = request.headers.get('host') ?? ''
  const { getSlugFromHost, getAdminTenantLean } = await import('@/lib/tenant')
  const slug = getSlugFromHost(host)
  const tenant = await getAdminTenantLean(slug)
  if (!tenant || tenant.email !== user.email) return null
  return tenant
}

export async function GET(request: Request) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') ?? 50)))
  const skip = (page - 1) * limit

  const where = {
    tenantId: tenant.id,
    ...(q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { sku: { contains: q, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  const [products, total] = await db.$transaction([
    db.product.findMany({
      where,
      include: { category: { select: { name: true } }, badge: { select: { text: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    db.product.count({ where }),
  ])

  return NextResponse.json({ products, total })
}

export async function POST(request: Request) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    name, slug, description, price, comparePrice, stock, showStock, trackStock,
    sku, images, featured, active, categoryId, badge, variantGroups,
  } = body

  type VariantGroupInput = { name: string; required: boolean; order: number; options: { name: string; order: number }[] }

  const product = await db.product.create({
    data: {
      tenantId: tenant.id,
      name,
      slug,
      description,
      price,
      comparePrice,
      stock,
      showStock,
      trackStock,
      sku,
      images: images ?? [],
      featured: featured ?? false,
      active: active ?? true,
      categoryId: categoryId ?? null,
      ...(badge && {
        badge: {
          create: { text: badge.text, color: badge.color, type: badge.type },
        },
      }),
      ...(variantGroups?.length && {
        variantGroups: {
          create: (variantGroups as VariantGroupInput[]).map(g => ({
            name: g.name,
            required: g.required,
            order: g.order,
            options: { create: g.options.map(o => ({ name: o.name, order: o.order })) },
          })),
        },
      }),
    },
    include: { badge: true, category: true },
  })

  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json(product, { status: 201 })
}
