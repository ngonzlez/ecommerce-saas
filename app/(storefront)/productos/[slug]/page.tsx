import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import { db } from '@/lib/db'
import ProductDetailClient from './ProductDetailClient'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const headersList = await headers()
  const tenantSlug = headersList.get('x-tenant-slug') ?? getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) return {}

  const product = await db.product.findFirst({
    where: { slug, tenantId: tenant.id, active: true },
    select: { name: true, description: true, images: true },
  })
  if (!product) return { title: 'Producto no encontrado' }

  return {
    title: product.name,
    description: product.description ?? `${product.name} — ${tenant.name}`,
    openGraph: {
      title: `${product.name} | ${tenant.name}`,
      description: product.description ?? undefined,
      images: product.images[0] ? [{ url: product.images[0] }] : tenant.logoUrl ? [{ url: tenant.logoUrl }] : [],
    },
  }
}

export default function ProductDetailPage() {
  return <ProductDetailClient />
}
