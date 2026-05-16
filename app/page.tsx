import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import { db } from '@/lib/db'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat'
import HeroBannerCarousel from '@/components/home/HeroBannerCarousel'
import MarqueeTicker from '@/components/home/MarqueeTicker'
import ProductCard from '@/components/storefront/ProductCard'
import CartDrawer from '@/components/storefront/CartDrawer'
import Image from 'next/image'
import Link from 'next/link'

export default async function HomePage() {
  const headersList = await headers()
  const slug = getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const heroBanners = tenant.banners.filter((b) => b.type === 'hero')
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

  return (
    <>
      <Navbar tenantName={tenant.name} logoUrl={tenant.logoUrl} categories={tenant.categories} />
      <CartDrawer />

      <main className="pt-14 md:pt-16">
        <HeroBannerCarousel banners={heroBanners} />

        {marqueeTexts.length > 0 && <MarqueeTicker texts={marqueeTexts} />}

        {/* Categorías */}
        {categories.length > 0 && (
          <section className="py-10 md:py-16 px-4 max-w-7xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Categorías</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border hover:border-[var(--color-primary)] hover:shadow-sm transition-all"
                >
                  {cat.imageUrl ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                      <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg">📦</div>
                  )}
                  <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Destacados */}
        {featuredProducts.length > 0 && (
          <section className="py-10 md:py-16 px-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Destacados</h2>
              <Link href="/productos" className="text-sm font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {featuredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  price={p.price}
                  comparePrice={p.comparePrice}
                  images={p.images}
                  stock={p.stock}
                  showStock={p.showStock}
                  badge={p.badge}
                />
              ))}
            </div>
          </section>
        )}

        {/* Ofertas */}
        {offerProducts.length > 0 && (
          <section className="py-10 md:py-16 px-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">🔥 Ofertas</h2>
              <Link href="/productos?ofertas=true" className="text-sm font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {offerProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  price={p.price}
                  comparePrice={p.comparePrice}
                  images={p.images}
                  stock={p.stock}
                  showStock={p.showStock}
                  badge={p.badge}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer
        tenantName={tenant.name}
        whatsappNumber={tenant.whatsappNumber}
        address={tenant.address}
        email={tenant.email}
        socialLinks={tenant.socialLinks}
      />

      {tenant.whatsappFloatingButton && tenant.whatsappNumber && (
        <WhatsAppFloat number={tenant.whatsappNumber} />
      )}
    </>
  )
}
