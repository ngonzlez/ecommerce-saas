'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  imageUrl: string
  title: string
  subtitle?: string
  linkUrl?: string
  linkText?: string
  reverse?: boolean
}

export default function SplitSection({ imageUrl, title, subtitle, linkUrl, linkText = 'Ver más', reverse = false }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
      <div className={`flex flex-col md:flex-row gap-0 rounded-2xl overflow-hidden shadow-sm ${reverse ? 'md:flex-row-reverse' : ''}`}>
        <motion.div
          className="relative w-full md:w-1/2 h-64 md:h-96"
          initial={{ opacity: 0, x: reverse ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        </motion.div>
        <motion.div
          className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-12 py-10 bg-[var(--color-primary)]"
          initial={{ opacity: 0, x: reverse ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">{title}</h2>
          {subtitle && <p className="text-white/80 text-base md:text-lg mb-8 leading-relaxed">{subtitle}</p>}
          {linkUrl && (
            <Link
              href={linkUrl}
              className="inline-block self-start px-7 py-3 rounded-full bg-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ color: 'var(--color-primary)' }}
            >
              {linkText}
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  )
}
