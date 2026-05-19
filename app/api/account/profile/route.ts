import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import { db } from '@/lib/db'

async function getAuthedCustomer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null

  const headersList = await headers()
  const slug = getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await getTenantBySlug(slug)
  if (!tenant) return null

  const customer = await db.customer.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: user.email } },
  })
  return { customer, tenant, user }
}

export async function GET() {
  const ctx = await getAuthedCustomer()
  if (!ctx?.customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { customer } = ctx
  return NextResponse.json({ name: customer.name, phone: customer.phone, address: customer.address, email: customer.email })
}

export async function PUT(request: Request) {
  const ctx = await getAuthedCustomer()
  if (!ctx?.customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, phone, address } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

  const updated = await db.customer.update({
    where: { id: ctx.customer.id },
    data: { name: name.trim(), phone: phone?.trim() || null, address: address?.trim() || null },
  })

  return NextResponse.json({ name: updated.name, phone: updated.phone, address: updated.address })
}
