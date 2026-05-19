import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { db } from '@/lib/db'

async function assertSuperAdmin() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
  if (!user || (superAdminEmail && user.email !== superAdminEmail)) return null
  return user
}

export async function GET() {
  const user = await assertSuperAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenants = await db.tenant.findMany({
    select: { id: true, slug: true, name: true, email: true, suspended: true, customDomain: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ tenants })
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function POST(req: NextRequest) {
  const user = await assertSuperAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, slug: rawSlug, email, password } = body as { name: string; slug: string; email: string; password: string }

  if (!name || !rawSlug || !email || !password) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Contraseña mínimo 8 caracteres', field: 'password' }, { status: 400 })
  }

  const slug = slugify(rawSlug)

  const existing = await db.tenant.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'El slug ya existe', field: 'slug' }, { status: 409 })
  }

  const adminClient = createAdminClient()
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  try {
    const tenant = await db.tenant.create({
      data: { slug, name, email },
    })
    return NextResponse.json({ tenant }, { status: 201 })
  } catch (err) {
    // Rollback Supabase user if DB insert fails
    await adminClient.auth.admin.deleteUser(authData.user.id)
    console.error(err)
    return NextResponse.json({ error: 'Error al crear tenant' }, { status: 500 })
  }
}
