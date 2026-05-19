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
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderNumber } = await params
  const order = await db.order.findFirst({
    where: { orderNumber, tenantId: tenant.id },
    include: {
      items: true,
      customer: true,
      shippingMethod: true,
      coupon: true,
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(order)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderNumber } = await params
  const existing = await db.order.findFirst({ where: { orderNumber, tenantId: tenant.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { status } = await request.json()
  const order = await db.order.update({
    where: { id: existing.id },
    data: { status },
    include: { items: true, customer: true, shippingMethod: true },
  })

  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json(order)
}
