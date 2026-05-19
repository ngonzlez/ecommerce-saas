import Image from 'next/image'
import Link from 'next/link'
import { Flame, Tag, ShoppingBag, Shirt, Tv, Smartphone, Home, Utensils, BookOpen, Dumbbell, Baby, Car, Heart, Laptop, Watch, Camera, Music, Gamepad2, Flower, Dog, Plane, Coffee, Package, Sparkles, Bike, Gem } from 'lucide-react'
import HeroBannerCarousel from './HeroBannerCarousel'
import MarqueeTicker from './MarqueeTicker'
import PromoBanner from './PromoBanner'
import ProductCard from '@/components/storefront/ProductCard'
import type { HomeTemplateProps } from './types'

const CAT_ICONS: Record<string, React.ElementType> = {
  ShoppingBag, Shirt, Tv, Smartphone, Laptop, Camera, Watch, Gem, Home, Utensils,
  Coffee, Baby, Dumbbell, Bike, Car, Plane, BookOpen, Music, Gamepad2, Dog, Flower,
  Heart, Sparkles, Package, Tag,
}

export default function HomeGrid({
  heroBanners, promoBannersTop, promoBannersMiddle, promoBannersBottom,
  marqueeTexts, featuredProducts, offerProducts, categories,
}: HomeTemplateProps) {
  return (
    <main>
      <HeroBannerCarousel banners={heroBanners} />

      {marqueeTexts.length > 0 && <MarqueeTicker texts={marqueeTexts} />}

      <PromoBanner banners={promoBannersTop} />

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
                ) : cat.icon && CAT_ICONS[cat.icon] ? (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.9 }}>
                    {(() => { const Icon = CAT_ICONS[cat.icon!]!; return <Icon size={22} className="text-white" /> })()}
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Tag size={20} className="text-gray-400" />
                  </div>
                )}
                <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <PromoBanner banners={promoBannersMiddle} />

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
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      )}

      {offerProducts.length > 0 && (
        <section className="py-10 md:py-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Flame size={22} className="text-orange-500" />Ofertas
            </h2>
            <Link href="/productos?ofertas=true" className="text-sm font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
