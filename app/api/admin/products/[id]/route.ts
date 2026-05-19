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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const product = await db.product.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      badge: true,
      category: true,
      variantGroups: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } },
    },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(product)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await db.product.findFirst({ where: { id, tenantId: tenant.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const {
    name, slug, description, price, comparePrice, stock, showStock, trackStock,
    sku, images, featured, active, categoryId, badge, variantGroups,
  } = body

  type VariantGroupInput = { name: string; required: boolean; order: number; options: { name: string; order: number }[] }

  await db.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        name, slug, description, price, comparePrice, stock, showStock, trackStock, sku,
        images, featured, active, categoryId: categoryId ?? null,
        ...(badge && {
          badge: {
            upsert: {
              create: { text: badge.text, color: badge.color, type: badge.type },
              update: { text: badge.text, color: badge.color, type: badge.type },
            },
          },
        }),
      },
    })

    if (!badge) {
      await tx.productBadge.deleteMany({ where: { productId: id } })
    }

    if (variantGroups !== undefined) {
      await tx.productVariantGroup.deleteMany({ where: { productId: id } })
      for (const g of (variantGroups as VariantGroupInput[])) {
        await tx.productVariantGroup.create({
          data: {
            productId: id,
            name: g.name,
            required: g.required,
            order: g.order,
            options: {
              create: g.options.map((o) => ({ name: o.name, order: o.order })),
            },
          },
        })
      }
    }
  })

  const product = await db.product.findFirst({
    where: { id },
    include: {
      badge: true,
      category: true,
      variantGroups: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } },
    },
  })

  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json(product)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await db.product.findFirst({ where: { id, tenantId: tenant.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.product.delete({ where: { id } })
  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json({ success: true })
}
