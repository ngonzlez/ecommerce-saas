import { headers } from 'next/headers'
import type { MetadataRoute } from 'next'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  const slug = headersList.get('x-tenant-slug') ?? getSlugFromHost(host)
  const tenant = await getTenantBySlug(slug)
  if (!tenant) return []

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'tuapp.com'
  const baseUrl = tenant.customDomain
    ? `https://${tenant.customDomain}`
    : `https://${tenant.slug}.${appDomain}`

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { tenantId: tenant.id, active: true },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({
      where: { tenantId: tenant.id },
      select: { slug: true },
    }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/productos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/productos?categoria=${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/productos/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
