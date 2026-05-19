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

  const branches = await db.branch.findMany({
    where: { tenantId: tenant.id },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(branches)
}

export async function POST(request: Request) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, address, city, phone, hours, icon, mapUrl, order, enabled } = await request.json()

  const branch = await db.branch.create({
    data: {
      tenantId: tenant.id,
      name,
      address: address || null,
      city: city || null,
      phone: phone || null,
      hours: hours || null,
      icon: icon || 'MapPin',
      mapUrl: mapUrl || null,
      order: order ?? 0,
      enabled: enabled ?? true,
    },
  })

  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json(branch, { status: 201 })
}
