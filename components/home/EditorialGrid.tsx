'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  title: string
  subtitle?: string
  linkUrl?: string
  linkText?: string
  images: string[]
}

export default function EditorialGrid({ title, subtitle, linkUrl, linkText = 'Ver colección', images }: Props) {
  const grid = images.slice(0, 4)

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <motion.div
          className="w-full md:w-2/5 flex flex-col gap-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">{title}</h2>
          {subtitle && <p className="text-gray-500 text-base leading-relaxed">{subtitle}</p>}
          {linkUrl && (
            <Link
              href={linkUrl}
              className="inline-block self-start mt-2 px-7 py-3 rounded-full font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {linkText}
            </Link>
          )}
        </motion.div>

        {grid.length > 0 && (
          <motion.div
            className="w-full md:w-3/5 grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            {grid.map((src, i) => (
              <div key={i} className={`relative overflow-hidden rounded-xl bg-gray-100 ${i === 0 ? 'row-span-2 h-64 md:h-full' : 'h-32 md:h-auto'}`} style={{ minHeight: i === 0 ? 260 : 120 }}>
                <Image src={src} alt="" fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
