import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { db } from './db'
export { formatPrice, calcDiscountPercent } from './format'

export type TenantWithRelations = Awaited<ReturnType<typeof getTenantBySlug>>

function fetchTenantBySlug(slug: string) {
  return db.tenant.findFirst({
    where: { OR: [{ slug }, { customDomain: slug }] },
    include: {
      banners: { where: { enabled: true }, orderBy: { order: 'asc' } },
      marqueeTexts: { where: { enabled: true }, orderBy: { order: 'asc' } },
      shippingMethods: { where: { enabled: true }, orderBy: { order: 'asc' } },
      paymentMethods: { where: { enabled: true }, orderBy: { order: 'asc' } },
      socialLinks: { where: { enabled: true }, orderBy: { order: 'asc' } },
      categories: { orderBy: { name: 'asc' } },
      branches: { where: { enabled: true }, orderBy: { order: 'asc' } },
      contactNumbers: { where: { enabled: true }, orderBy: { order: 'asc' } },
    },
  })
}

// React cache deduplicates within a request; unstable_cache persists 5 min across requests
export const getTenantBySlug = cache(async function getTenantBySlug(slug: string) {
  return unstable_cache(
    () => fetchTenantBySlug(slug),
    ['tenant', slug],
    { tags: [`tenant-${slug}`], revalidate: 300 }
  )()
})

// Lean version for admin API route auth — no relations, minimal fields
export async function getAdminTenantLean(slug: string) {
  return db.tenant.findFirst({
    where: { OR: [{ slug }, { customDomain: slug }] },
    select: { id: true, email: true, name: true, slug: true },
  })
}

export function getSlugFromHost(host: string): string {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'tuapp.com'
  const hostname = host.split(':')[0]
  const clean = hostname.replace(/^www\./, '')
  if (clean === 'localhost' || clean === appDomain) {
    return process.env.TENANT_SLUG_DEV ?? 'demo'
  }
  if (clean.endsWith(`.${appDomain}`)) {
    return clean.slice(0, clean.length - appDomain.length - 1)
  }
  return clean
}

