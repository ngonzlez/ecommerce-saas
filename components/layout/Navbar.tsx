'use client'
import { useState } from 'react'
import { Menu, X, ShoppingCart, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/cart'

type Props = {
  tenantName: string
  logoUrl: string | null
  categories: { id: string; name: string; slug: string }[]
}

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Tienda' },
  { href: '/sobre-nosotros', label: 'Sobre Nosotros' },
  { href: '/favoritos', label: 'Mis favoritos', icon: Heart },
  { href: '/contacto', label: 'Contacto' },
]

const DESKTOP_LINKS = NAV_LINKS.filter((l) => l.href !== '/' && l.href !== '/favoritos')

export default function Navbar({ tenantName, logoUrl, categories }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const items = useCartStore((s) => s.items)
  const openCart = useCartStore((s) => s.openCart)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-base md:text-lg shrink-0">
            {logoUrl ? (
              <Image src={logoUrl} alt={tenantName} width={36} height={36} className="object-contain" />
            ) : null}
            <span>{tenantName}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {DESKTOP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-opacity hover:opacity-70 ${pathname === link.href ? 'opacity-100' : 'opacity-60'}`}
                style={pathname === link.href ? { color: 'var(--color-primary)' } : {}}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link href="/favoritos" className="hidden md:flex p-2 hover:opacity-70 transition-opacity">
              <Heart size={20} />
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
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 py-3 px-3 rounded-xl text-sm font-medium transition-colors ${active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                  style={active ? { backgroundColor: 'var(--color-primary)' } : {}}
                >
                  {Icon && <Icon size={17} className={active ? 'text-white' : 'text-gray-400'} />}
                  {link.label}
                </Link>
              )
            })}
          </div>
          {categories.length > 0 && (
            <div className="border-t px-4 py-3">
              <p className="text-xs font-semibold uppercase text-gray-400 mb-2 px-3">Categorías</p>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center py-2 px-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
