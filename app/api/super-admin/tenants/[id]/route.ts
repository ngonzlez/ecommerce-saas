import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { db } from '@/lib/db'

async function assertSuperAdmin() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
  if (!user || (superAdminEmail && user.email !== superAdminEmail)) return null
  return user
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await assertSuperAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const tenant = await db.tenant.findUnique({
    where: { id },
    select: { id: true, slug: true, name: true, email: true, suspended: true, customDomain: true, createdAt: true },
  })
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(tenant)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await assertSuperAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, email, customDomain, suspended } = body as {
    name?: string; email?: string; customDomain?: string; suspended?: boolean
  }

  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (email !== undefined) data.email = email
  if (suspended !== undefined) data.suspended = suspended
  if (customDomain !== undefined) data.customDomain = customDomain || null

  try {
    const tenant = await db.tenant.update({ where: { id }, data })
    return NextResponse.json(tenant)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await assertSuperAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await db.tenant.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
