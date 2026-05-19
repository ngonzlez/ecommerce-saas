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

  const banners = await db.banner.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ type: 'asc' }, { order: 'asc' }],
  })

  return NextResponse.json(banners)
}

export async function POST(request: Request) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, imageUrl, title, subtitle, linkUrl, linkText, position, order, enabled } = await request.json()

  const banner = await db.banner.create({
    data: {
      tenantId: tenant.id,
      type: type ?? 'hero',
      imageUrl,
      title,
      subtitle,
      linkUrl,
      linkText: linkText ?? null,
      position: position ?? 'top',
      order: order ?? 0,
      enabled: enabled ?? true,
    },
  })

  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json(banner, { status: 201 })
}
