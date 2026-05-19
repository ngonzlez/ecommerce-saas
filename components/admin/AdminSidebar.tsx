'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Ticket,
  Truck,
  CreditCard,
  Image,
  AlignLeft,
  Palette,
  Share2,
  Settings,
  Info,
  MapPin,
  Phone,
  Shield,
  FileUp,
} from 'lucide-react'

const items = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Productos', href: '/admin/productos', icon: Package },
  { label: 'Importar', href: '/admin/importar', icon: FileUp },
  { label: 'Categorías', href: '/admin/categorias', icon: Tag },
  { label: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
  { label: 'Cupones', href: '/admin/cupones', icon: Ticket },
  { label: 'Envíos', href: '/admin/envios', icon: Truck },
  { label: 'Pagos', href: '/admin/pagos', icon: CreditCard },
  { label: 'Banners', href: '/admin/banners', icon: Image },
  { label: 'Marquee', href: '/admin/marquee', icon: AlignLeft },
  { label: 'Diseño', href: '/admin/diseno', icon: Palette },
  { label: 'Redes Sociales', href: '/admin/redes', icon: Share2 },
  { label: 'Sucursales', href: '/admin/sucursales', icon: MapPin },
  { label: 'Contactos', href: '/admin/contactos', icon: Phone },
  { label: 'Sobre Nosotros', href: '/admin/sobre-nosotros', icon: Info },
  { label: 'Privacidad', href: '/admin/privacidad', icon: Shield },
  { label: 'Configuración', href: '/admin/config', icon: Settings },
]

export default function AdminSidebar({ tenantName }: { tenantName: string }) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-30">
      <div className="px-6 py-5 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Admin</span>
        <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{tenantName}</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                active
                  ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-700 rounded-l-none'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={16} className={active ? 'text-slate-700' : 'text-gray-400'} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
