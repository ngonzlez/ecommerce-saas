import Image from 'next/image'
import Link from 'next/link'
import { Flame } from 'lucide-react'
import MarqueeTicker from './MarqueeTicker'
import PromoBanner from './PromoBanner'
import EditorialGrid from './EditorialGrid'
import FadeInSection from './FadeInSection'
import ProductCard from '@/components/storefront/ProductCard'
import type { HomeTemplateProps } from './types'

export default function HomeMagazine({
  heroBanners, promoBannersTop, promoBannersMiddle, promoBannersBottom,
  marqueeTexts, featuredProducts, offerProducts, categories,
}: HomeTemplateProps) {
  const hero = heroBanners[0]
  const [featured, ...rest] = featuredProducts
  const editorialImages = featuredProducts.flatMap((p) => p.images).slice(0, 4)

  return (
    <main>
      {/* Editorial banner — tall but not fullscreen */}
      <section className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden">
        {hero?.imageUrl ? (
          <Image src={hero.imageUrl} alt={hero.title ?? ''} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: 'var(--color-primary)' }} />
        )}
        <div className="absolute inset-0 bg-black/50 flex items-end pb-10 md:pb-16">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
            <div className="flex items-end justify-between">
              <div className="max-w-xl">
                {hero?.subtitle && (
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">{hero.subtitle}</p>
                )}
                {hero?.title && (
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">{hero.title}</h1>
                )}
              </div>
              {hero?.linkUrl && (
                <Link
                  href={hero.linkUrl}
                  className="hidden sm:inline-block px-7 py-3 rounded-full border-2 border-white text-white text-sm font-bold hover:bg-white hover:text-black transition-colors"
                >
                  {hero.linkText ?? 'Ver más'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {marqueeTexts.length > 0 && <MarqueeTicker texts={marqueeTexts} />}

      <PromoBanner banners={promoBannersTop} />

      {/* Categories as image tiles */}
      {categories.length > 0 && (
        <FadeInSection>
        <section className="py-10 md:py-16 px-4 max-w-7xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-6">Categorías</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="group relative rounded-xl overflow-hidden aspect-square bg-gray-100"
              >
                {cat.imageUrl && (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold leading-tight">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        </FadeInSection>
      )}

      {/* Editorial featured — 1 big + grid */}
      {featuredProducts.length > 0 && (
        <FadeInSection delay={0.05}>
        <section className="py-10 md:py-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-black">Destacados</h2>
            <Link href="/productos" className="text-sm font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Big featured card */}
            {featured && (
              <Link
                href={`/productos/${featured.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex flex-col"
              >
                {featured.images[0] && (
                  <div className="relative w-full aspect-square overflow-hidden">
                    <Image
                      src={featured.images[0]}
                      alt={featured.name}
                      fill
                      className="object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1 line-clamp-2">{featured.name}</h3>
                  <p className="text-xl font-black" style={{ color: 'var(--color-primary)' }}>
                    {featured.comparePrice ? (
                      <span className="flex items-center gap-2">
                        <span>Gs. {featured.price.toLocaleString()}</span>
                        <span className="text-sm font-normal text-gray-400 line-through">Gs. {featured.comparePrice.toLocaleString()}</span>
                      </span>
                    ) : (
                      `Gs. ${featured.price.toLocaleString()}`
                    )}
                  </p>
                </div>
              </Link>
            )}

            {/* 3 smaller cards */}
            <div className="grid grid-cols-1 gap-4">
              {rest.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  href={`/productos/${p.slug}`}
                  className="group flex gap-4 rounded-xl border border-gray-100 p-3 hover:shadow-sm transition-shadow bg-white"
                >
                  {p.images[0] && (
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="flex flex-col justify-center">
                    <span className="font-semibold text-sm line-clamp-2 mb-1">{p.name}</span>
                    <span className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
                      Gs. {p.price.toLocaleString()}
                    </span>
                    {p.comparePrice && (
                      <span className="text-xs text-gray-400 line-through">Gs. {p.comparePrice.toLocaleString()}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        </FadeInSection>
      )}

      <PromoBanner banners={promoBannersMiddle} />

      {/* Editorial grid section */}
      {editorialImages.length >= 2 && (
        <EditorialGrid
          title="Nuestra colección"
          subtitle="Explorá todos nuestros productos y encontrá lo que buscás."
          linkUrl="/productos"
          images={editorialImages}
        />
      )}

      {/* Offers */}
      {offerProducts.length > 0 && (
        <section className="py-10 md:py-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <Flame size={24} className="text-orange-500" />Ofertas
            </h2>
            <Link href="/productos?ofertas=true" className="text-sm font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {offerProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      )}

      <PromoBanner banners={promoBannersBottom} />
    </main>
  )
}
