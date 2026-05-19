import { NextRequest, NextResponse } from 'next/server'
import { getAdminTenantLean, getSlugFromHost } from '@/lib/tenant'

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const slug = req.headers.get('x-tenant-slug') ?? getSlugFromHost(host)
  const userEmail = req.headers.get('x-user-email') ?? ''

  const tenant = await getAdminTenantLean(slug)
  if (!tenant || tenant.email !== userEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json({ ok: true })
}
