import Image from 'next/image'
import Link from 'next/link'
import { Flame } from 'lucide-react'
import MarqueeTicker from './MarqueeTicker'
import PromoBanner from './PromoBanner'
import SplitSection from './SplitSection'
import FadeInSection from './FadeInSection'
import ProductCard from '@/components/storefront/ProductCard'
import type { HomeTemplateProps } from './types'

export default function HomeHero({
  heroBanners, promoBannersTop, promoBannersMiddle, promoBannersBottom,
  marqueeTexts, featuredProducts, offerProducts, categories,
}: HomeTemplateProps) {
  const hero = heroBanners[0]
  const splitBanner = heroBanners[1] ?? null

  return (
    <main>
      {/* Fullscreen hero */}
      <section className="relative w-full h-[70vh] md:h-screen max-h-[860px] overflow-hidden">
        {hero?.imageUrl ? (
          <Image src={hero.imageUrl} alt={hero.title ?? ''} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end pb-16 px-6 md:px-16 max-w-7xl mx-auto">
          {hero?.title && (
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-4 max-w-3xl">
              {hero.title}
            </h1>
          )}
          {hero?.subtitle && (
            <p className="text-white/80 text-base md:text-xl mb-8 max-w-xl leading-relaxed">{hero.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <Link
              href={hero?.linkUrl ?? '/productos'}
              className="inline-block px-8 py-3.5 rounded-full font-bold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {hero?.linkText ?? 'Ver productos'}
            </Link>
            <Link
              href="/productos"
              className="inline-block px-8 py-3.5 rounded-full font-bold text-sm bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/30"
            >
              Explorar todo
            </Link>
          </div>
        </div>
      </section>

      {marqueeTexts.length > 0 && <MarqueeTicker texts={marqueeTexts} />}

      <PromoBanner banners={promoBannersTop} />

      {/* Category horizontal scroll */}
      {categories.length > 0 && (
        <section className="py-8 px-4 max-w-7xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="flex-shrink-0 snap-start flex items-center gap-2.5 px-5 py-2.5 rounded-full border-2 border-gray-200 hover:border-[var(--color-primary)] font-medium text-sm transition-colors whitespace-nowrap"
              >
                {cat.imageUrl && (
                  <div className="relative w-5 h-5 rounded-full overflow-hidden">
                    <Image src={cat.imageUrl} alt="" fill className="object-cover" />
                  </div>
                )}
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products — wider 2-col on mobile, 3-col desktop */}
      {featuredProducts.length > 0 && (
        <FadeInSection>
          <section className="py-10 md:py-16 px-4 max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-primary)' }}>Selección</p>
                <h2 className="text-2xl sm:text-3xl font-black">Destacados</h2>
              </div>
              <Link href="/productos" className="text-sm font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        </FadeInSection>
      )}

      {/* Split promo */}
      {splitBanner?.imageUrl && (
        <SplitSection
          imageUrl={splitBanner.imageUrl}
          title={splitBanner.title ?? ''}
          subtitle={splitBanner.subtitle ?? undefined}
          linkUrl={splitBanner.linkUrl ?? undefined}
          linkText={splitBanner.linkText ?? undefined}
        />
      )}

      <PromoBanner banners={promoBannersMiddle} />

      {/* Offers */}
      {offerProducts.length > 0 && (
        <FadeInSection delay={0.05}>
          <section className="py-10 md:py-16 px-4 max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-orange-500">Precios especiales</p>
                <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                  <Flame size={26} className="text-orange-500" />Ofertas
                </h2>
              </div>
              <Link href="/productos?ofertas=true" className="text-sm font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {offerProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        </FadeInSection>
      )}

      <PromoBanner banners={promoBannersBottom} />
    </main>
  )
}
