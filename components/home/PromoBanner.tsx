import Image from 'next/image'
import Link from 'next/link'

type Banner = {
  id: string
  imageUrl: string | null
  title: string | null
  subtitle: string | null
  linkUrl: string | null
  linkText: string | null
}

type Props = {
  banners: Banner[]
}

export default function PromoBanner({ banners }: Props) {
  if (banners.length === 0) return null

  if (banners.length === 1) {
    const b = banners[0]
    return (
      <section className="px-4 max-w-7xl mx-auto py-4">
        <PromoCard banner={b} />
      </section>
    )
  }

  return (
    <section className="px-4 max-w-7xl mx-auto py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {banners.map(b => <PromoCard key={b.id} banner={b} />)}
      </div>
    </section>
  )
}

function PromoCard({ banner: b }: { banner: Banner }) {
  const inner = (
    <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden bg-gray-200 group">
      {b.imageUrl && (
        <Image
          src={b.imageUrl}
          alt={b.title ?? ''}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      {(b.title || b.subtitle || b.linkText) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-5">
          {b.title && <p className="text-white font-bold text-xl leading-tight drop-shadow">{b.title}</p>}
          {b.subtitle && <p className="text-white/80 text-sm mt-1 drop-shadow">{b.subtitle}</p>}
          {b.linkText && b.linkUrl && (
            <span className="mt-3 self-start bg-white text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
              {b.linkText}
            </span>
          )}
        </div>
      )}
    </div>
  )

  return b.linkUrl ? (
    <Link href={b.linkUrl}>{inner}</Link>
  ) : inner
}
