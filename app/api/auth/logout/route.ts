import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_DOMAIN ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}` : 'http://localhost:3000'), { status: 302 })
}
