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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await db.banner.findFirst({ where: { id, tenantId: tenant.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { type, imageUrl, title, subtitle, linkUrl, linkText, position, order, enabled } = await request.json()

  const banner = await db.banner.update({
    where: { id },
    data: { type, imageUrl, title, subtitle, linkUrl, linkText: linkText ?? null, position: position ?? 'top', order, enabled },
  })

  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json(banner)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await db.banner.findFirst({ where: { id, tenantId: tenant.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.banner.delete({ where: { id } })
  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json({ success: true })
}
