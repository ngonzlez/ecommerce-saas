import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { getSlugFromHost } from '@/lib/tenant'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { items } = await req.json() as { items: string[] }
  if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ ok: true })

  const headersList = await headers()
  const tenantSlug = getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true } })
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let customer = await db.customer.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: user.email! } },
  })
  if (!customer) {
    customer = await db.customer.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        name: user.user_metadata?.full_name ?? user.email!,
        email: user.email!,
      },
    })
  }

  // Only sync products that belong to this tenant
  const validProducts = await db.product.findMany({
    where: { id: { in: items }, tenantId: tenant.id },
    select: { id: true },
  })

  await Promise.all(
    validProducts.map((p) =>
      db.favorite.upsert({
        where: { customerId_productId: { customerId: customer!.id, productId: p.id } },
        update: {},
        create: { customerId: customer!.id, productId: p.id },
      })
    )
  )

  return NextResponse.json({ ok: true, synced: validProducts.length })
}
