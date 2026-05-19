import Link from 'next/link'
import { Flame } from 'lucide-react'
import MarqueeTicker from './MarqueeTicker'
import FadeInSection from './FadeInSection'
import ProductCard from '@/components/storefront/ProductCard'
import type { HomeTemplateProps } from './types'

export default function HomeMinimal({
  marqueeTexts, featuredProducts, offerProducts, categories, tenantName,
}: HomeTemplateProps) {
  return (
    <main>
      {/* Typographic hero — no image */}
      <section className="px-4 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4 opacity-50">{tenantName}</p>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter mb-8" style={{ color: 'var(--color-primary)' }}>
            Nueva<br />colección.
          </h1>
          <p className="text-gray-500 text-lg md:text-xl mb-10 max-w-md leading-relaxed">
            Descubrí lo mejor de nuestra tienda, seleccionado para vos.
          </p>
          <Link
            href="/productos"
            className="inline-block px-10 py-4 rounded-full font-bold text-base text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Explorar
          </Link>
        </div>
      </section>

      {marqueeTexts.length > 0 && <MarqueeTicker texts={marqueeTexts} />}

      {/* Categories — minimal text links */}
      {categories.length > 0 && (
        <section className="px-4 py-8 max-w-7xl mx-auto border-t border-b border-gray-100">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mr-2">Categorías</span>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="text-sm font-medium px-4 py-1.5 rounded-full border border-gray-200 hover:border-gray-800 hover:bg-gray-900 hover:text-white transition-all"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured — clean 3-col grid with generous spacing */}
      {featuredProducts.length > 0 && (
        <FadeInSection>
        <section className="py-16 md:py-20 px-4 max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Destacados</h2>
            <Link href="/productos" className="text-sm underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
        </FadeInSection>
      )}

      {/* Divider */}
      {offerProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-t border-gray-100" />
        </div>
      )}

      {/* Offers */}
      {offerProducts.length > 0 && (
        <FadeInSection delay={0.05}>
        <section className="py-16 md:py-20 px-4 max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-2">
              <Flame size={28} className="text-orange-500" />
              Ofertas
            </h2>
            <Link href="/productos?ofertas=true" className="text-sm underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity">
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
            {offerProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
        </FadeInSection>
      )}
    </main>
  )
}
