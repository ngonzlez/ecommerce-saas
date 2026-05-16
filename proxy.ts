import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'tuapp.com'
  const hostname = host.split(':')[0].replace(/^www\./, '')

  let tenantSlug: string
  if (hostname === 'localhost' || hostname === appDomain) {
    tenantSlug = process.env.TENANT_SLUG_DEV ?? 'demo'
  } else {
    tenantSlug = hostname.replace(`.${appDomain}`, '')
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-slug', tenantSlug)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
