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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { title, phone, email, order, enabled } = await request.json()

  const contact = await db.contactNumber.update({
    where: { id, tenantId: tenant.id },
    data: { title, phone, email: email || null, order, enabled },
  })

  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json(contact)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.contactNumber.delete({ where: { id, tenantId: tenant.id } })

  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json({ ok: true })
}
