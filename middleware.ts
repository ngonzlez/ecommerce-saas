import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'tuapp.com'
  const hostname = host.split(':')[0].replace(/^www\./, '')

  // Super-admin subdomain → rewrite to /super-admin/*
  if (hostname === `admin.${appDomain}`) {
    const url = request.nextUrl.clone()
    const path = request.nextUrl.pathname
    url.pathname = path.startsWith('/super-admin') ? path : `/super-admin${path === '/' ? '/tenants' : path}`
    return NextResponse.rewrite(url)
  }

  let tenantSlug: string
  if (hostname === 'localhost' || hostname === appDomain) {
    tenantSlug = process.env.TENANT_SLUG_DEV ?? 'demo'
  } else if (hostname.endsWith(`.${appDomain}`)) {
    tenantSlug = hostname.slice(0, hostname.length - appDomain.length - 1)
  } else {
    tenantSlug = process.env.TENANT_SLUG_DEV ?? 'demo'
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-slug', tenantSlug)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
