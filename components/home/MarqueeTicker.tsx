'use client'
import { motion } from 'framer-motion'

export default function MarqueeTicker({ texts }: { texts: string[] }) {
  if (!texts.length) return null
  const repeated = [...texts, ...texts, ...texts]

  return (
    <div className="bg-[var(--color-primary)] text-white py-2 overflow-hidden">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
      >
        {repeated.map((text, i) => (
          <span key={i} className="text-sm font-medium shrink-0">
            {text} <span className="mx-2 opacity-60">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
