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

  const methods = await db.paymentMethodConfig.findMany({
    where: { tenantId: tenant.id },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(methods)
}

export async function PUT(request: Request) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items: { type: string; label: string; details?: string; enabled: boolean; order: number }[] =
    await request.json()

  const existing = await db.paymentMethodConfig.findMany({
    where: { tenantId: tenant.id },
  })
  const existingByType = new Map(existing.map((m) => [m.type, m]))

  const results = await Promise.all(
    items.map((item) => {
      const found = existingByType.get(item.type)
      if (found) {
        return db.paymentMethodConfig.update({
          where: { id: found.id },
          data: { label: item.label, details: item.details, enabled: item.enabled, order: item.order },
        })
      }
      return db.paymentMethodConfig.create({
        data: {
          tenantId: tenant.id,
          type: item.type,
          label: item.label,
          details: item.details,
          enabled: item.enabled,
          order: item.order,
        },
      })
    })
  )

  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json(results)
}
