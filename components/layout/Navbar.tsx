'use client'
import { useState, useEffect } from 'react'
import { Menu, X, ShoppingCart, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/cart'

type Props = {
  tenantName: string
  logoUrl: string | null
  categories: { id: string; name: string; slug: string }[]
}

export default function Navbar({ tenantName, logoUrl, categories }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const items = useCartStore((s) => s.items)
  const openCart = useCartStore((s) => s.openCart)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-base md:text-lg">
            {logoUrl ? (
              <Image src={logoUrl} alt={tenantName} width={36} height={36} className="object-contain" />
            ) : null}
            <span>{tenantName}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/productos" className="text-sm font-medium hover:opacity-70 transition-opacity">
              Productos
            </Link>
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="text-sm font-medium hover:opacity-70 transition-opacity"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/productos" className="p-2 hover:opacity-70 transition-opacity">
              <Search size={20} />
            </Link>
            <button onClick={openCart} className="relative p-2 hover:opacity-70 transition-opacity">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white font-bold bg-[var(--color-primary)]">
                  {totalItems}
                </span>
              )}
            </button>
            <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-2 shadow-lg">
          <Link href="/productos" onClick={() => setIsOpen(false)} className="py-2 text-sm font-medium border-b border-gray-100">
            Todos los productos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/productos?categoria=${cat.slug}`}
              onClick={() => setIsOpen(false)}
              className="py-2 text-sm border-b border-gray-100 last:border-0"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
