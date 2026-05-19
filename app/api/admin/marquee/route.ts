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

  const texts = await db.marqueeText.findMany({
    where: { tenantId: tenant.id },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(texts)
}

export async function POST(request: Request) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text, order, enabled } = await request.json()

  const marquee = await db.marqueeText.create({
    data: {
      tenantId: tenant.id,
      text,
      order: order ?? 0,
      enabled: enabled ?? true,
    },
  })

  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json(marquee, { status: 201 })
}
