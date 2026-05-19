import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

async function getAdminTenant(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return null

  const host = request.headers.get('host') ?? ''
  const { getSlugFromHost, getTenantBySlug } = await import('@/lib/tenant')
  const slug = getSlugFromHost(host)
  const tenant = await getTenantBySlug(slug)
  if (!tenant || tenant.email !== user.email) return null
  return tenant
}

export async function POST(request: Request) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const timestamp = Date.now()
  const filename = file.name.replace(/\s+/g, '-')
  const path = `${tenant.id}/${timestamp}-${filename}`

  const arrayBuffer = await file.arrayBuffer()
  const { error } = await supabaseAdmin.storage
    .from('media')
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[upload] Supabase storage error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabaseAdmin.storage.from('media').getPublicUrl(path)

  return NextResponse.json({ url: data.publicUrl }, { status: 201 })
}
