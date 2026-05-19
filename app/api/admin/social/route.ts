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

  const links = await db.socialLink.findMany({
    where: { tenantId: tenant.id },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(links)
}

export async function PUT(request: Request) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items: { platform: string; url: string; enabled: boolean; order: number }[] =
    await request.json()

  await db.$transaction([
    db.socialLink.deleteMany({ where: { tenantId: tenant.id } }),
    db.socialLink.createMany({
      data: items.map((item) => ({
        tenantId: tenant.id,
        platform: item.platform,
        url: item.url,
        enabled: item.enabled,
        order: item.order,
      })),
    }),
  ])

  const links = await db.socialLink.findMany({
    where: { tenantId: tenant.id },
    orderBy: { order: 'asc' },
  })

  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json(links)
}
