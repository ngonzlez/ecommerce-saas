'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type Banner = {
  id: string
  imageUrl: string | null
  title: string | null
  subtitle: string | null
  linkUrl: string | null
}

export default function HeroBannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const t = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000)
    return () => clearInterval(t)
  }, [banners.length])

  if (!banners.length) {
    return (
      <div className="w-full h-64 md:h-96 bg-gray-100 flex items-center justify-center text-gray-400">
        <p className="text-sm">Sin banners configurados</p>
      </div>
    )
  }

  const banner = banners[current]

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-[500px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {banner.imageUrl ? (
            <Image
              src={banner.imageUrl}
              alt={banner.title ?? ''}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-600" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-2xl">
              {banner.title && (
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight"
                >
                  {banner.title}
                </motion.h1>
              )}
              {banner.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm sm:text-base md:text-lg mb-6 opacity-90"
                >
                  {banner.subtitle}
                </motion.p>
              )}
              {banner.linkUrl && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <Link
                    href={banner.linkUrl}
                    className="inline-block px-6 py-3 rounded-full font-semibold text-sm bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
                  >
                    Ver más
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white scale-125' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
