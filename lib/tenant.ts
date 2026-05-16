import { db } from './db'
export { formatPrice, calcDiscountPercent } from './format'

export type TenantWithRelations = Awaited<ReturnType<typeof getTenantBySlug>>

export async function getTenantBySlug(slug: string) {
  return db.tenant.findUnique({
    where: { slug },
    include: {
      banners: { where: { enabled: true }, orderBy: { order: 'asc' } },
      marqueeTexts: { where: { enabled: true }, orderBy: { order: 'asc' } },
      shippingMethods: { where: { enabled: true }, orderBy: { order: 'asc' } },
      paymentMethods: { where: { enabled: true }, orderBy: { order: 'asc' } },
      socialLinks: { where: { enabled: true }, orderBy: { order: 'asc' } },
      categories: { orderBy: { name: 'asc' } },
    },
  })
}

export function getSlugFromHost(host: string): string {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'tuapp.com'
  // Strip port
  const hostname = host.split(':')[0]
  // Strip www
  const clean = hostname.replace(/^www\./, '')
  // In dev: use env var fallback
  if (clean === 'localhost' || clean === appDomain) {
    return process.env.TENANT_SLUG_DEV ?? 'demo'
  }
  // Extract subdomain: comercio1.tuapp.com → comercio1
  return clean.replace(`.${appDomain}`, '')
}

