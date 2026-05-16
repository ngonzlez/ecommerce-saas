'use client'
import { useEffect, useRef } from 'react'
import { formatPrice } from '@/lib/format'

type Props = {
  min: number
  max: number
  values: [number, number]
  onChange: (values: [number, number]) => void
  step?: number
}

export default function PriceRangeSlider({ min, max, values, onChange, step = 10000 }: Props) {
  const [minVal, maxVal] = values
  const fillRef = useRef<HTMLDivElement>(null)

  const pct = (val: number) => ((val - min) / (max - min)) * 100

  useEffect(() => {
    if (fillRef.current) {
      fillRef.current.style.left = `${pct(minVal)}%`
      fillRef.current.style.width = `${pct(maxVal) - pct(minVal)}%`
    }
  })

  return (
    <div className="px-1">
      <div className="relative h-6 mb-3">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-200 rounded-full">
          <div
            ref={fillRef}
            className="absolute h-full rounded-full"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
        </div>

        {/* Min input (transparent, interactive) */}
        <input
          type="range" min={min} max={max} step={step} value={minVal}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), maxVal - step)
            onChange([v, maxVal])
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: minVal >= maxVal - step ? 5 : 3 }}
        />
        {/* Max input (transparent, interactive) */}
        <input
          type="range" min={min} max={max} step={step} value={maxVal}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), minVal + step)
            onChange([minVal, v])
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
        />

        {/* Visual thumbs */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{ left: `${pct(minVal)}%`, backgroundColor: 'var(--color-primary)' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{ left: `${pct(maxVal)}%`, backgroundColor: 'var(--color-primary)' }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatPrice(minVal)}</span>
        <span>{formatPrice(maxVal)}</span>
      </div>
    </div>
  )
}
