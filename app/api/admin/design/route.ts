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

  const design = await db.tenant.findUnique({
    where: { id: tenant.id },
    select: {
      primaryColor: true,
      secondaryColor: true,
      logoUrl: true,
      faviconUrl: true,
      homeTemplate: true,
    },
  })

  return NextResponse.json(design)
}

export async function PUT(request: Request) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { primaryColor, secondaryColor, logoUrl, faviconUrl, homeTemplate } = await request.json()

  const updated = await db.tenant.update({
    where: { id: tenant.id },
    data: { primaryColor, secondaryColor, logoUrl, faviconUrl, homeTemplate },
    select: {
      id: true,
      primaryColor: true,
      secondaryColor: true,
      logoUrl: true,
      faviconUrl: true,
      homeTemplate: true,
    },
  })

  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json(updated)
}
