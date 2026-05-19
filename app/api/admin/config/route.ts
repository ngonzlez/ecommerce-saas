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

const configSelect = {
  id: true,
  name: true,
  email: true,
  address: true,
  whatsappNumber: true,
  customDomain: true,
  requireRegistration: true,
  allowGuestCheckout: true,
  whatsappFloatingButton: true,
} as const

export async function GET(request: Request) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = await db.tenant.findUnique({
    where: { id: tenant.id },
    select: configSelect,
  })

  return NextResponse.json(config)
}

export async function PUT(request: Request) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    name,
    email,
    address,
    whatsappNumber,
    customDomain,
    requireRegistration,
    allowGuestCheckout,
    whatsappFloatingButton,
  } = await request.json()

  // Validate customDomain uniqueness (exclude self)
  if (customDomain) {
    const conflict = await db.tenant.findFirst({
      where: { customDomain, NOT: { id: tenant.id } },
    })
    if (conflict) return NextResponse.json({ error: 'Ese dominio ya está en uso' }, { status: 409 })
  }

  const updated = await db.tenant.update({
    where: { id: tenant.id },
    data: {
      name,
      email,
      address,
      whatsappNumber,
      customDomain: customDomain?.trim().toLowerCase().replace(/^www\./, '') || null,
      requireRegistration,
      allowGuestCheckout,
      whatsappFloatingButton,
    },
    select: configSelect,
  })

  revalidateTag(`tenant-${tenant.slug}`, 'default')
  return NextResponse.json(updated)
}
