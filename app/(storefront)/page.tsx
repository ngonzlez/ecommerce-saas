import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import { db } from '@/lib/db'
import HomeGrid from '@/components/home/HomeGrid'
import HomeHero from '@/components/home/HomeHero'
import HomeMinimal from '@/components/home/HomeMinimal'
import HomeMagazine from '@/components/home/HomeMagazine'
import type { HomeTemplateProps } from '@/components/home/types'

export default async function HomePage() {
  const headersList = await headers()
  const slug = headersList.get('x-tenant-slug') ?? getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const heroBanners = tenant.banners.filter((b) => b.type === 'hero')
  const promoBannersTop = tenant.banners.filter((b) => b.type === 'promo' && b.position === 'top')
  const promoBannersMiddle = tenant.banners.filter((b) => b.type === 'promo' && b.position === 'middle')
  const promoBannersBottom = tenant.banners.filter((b) => b.type === 'promo' && b.position === 'bottom')
  const marqueeTexts = tenant.marqueeTexts.map((m) => m.text)

  const [featuredProducts, offerProducts, categories] = await Promise.all([
    db.product.findMany({
      where: { tenantId: tenant.id, featured: true, active: true },
      include: { badge: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    db.product.findMany({
      where: { tenantId: tenant.id, active: true, NOT: { comparePrice: null } },
      include: { badge: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    db.category.findMany({ where: { tenantId: tenant.id }, take: 6 }),
  ])

  const props: HomeTemplateProps = {
    heroBanners,
    promoBannersTop,
    promoBannersMiddle,
    promoBannersBottom,
    marqueeTexts,
    featuredProducts,
    offerProducts,
    categories,
    tenantName: tenant.name,
  }

  const template = tenant.homeTemplate ?? 'grid'

  if (template === 'hero') return <HomeHero {...props} />
  if (template === 'minimal') return <HomeMinimal {...props} />
  if (template === 'magazine') return <HomeMagazine {...props} />
  return <HomeGrid {...props} />
}
