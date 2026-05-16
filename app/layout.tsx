import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import { Toaster } from '@/components/ui/sonner'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat'
import CartDrawer from '@/components/storefront/CartDrawer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tienda Online',
  description: 'Tienda online',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const slug = getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await getTenantBySlug(slug)

  const primaryColor = tenant?.primaryColor ?? '#000000'
  const secondaryColor = tenant?.secondaryColor ?? '#ffffff'

  return (
    <html lang="es" className={inter.className}>
      <head>
        <style>{`
          :root {
            --color-primary: ${primaryColor};
            --color-secondary: ${secondaryColor};
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <Navbar
          tenantName={tenant?.name ?? ''}
          logoUrl={tenant?.logoUrl ?? null}
          categories={tenant?.categories ?? []}
        />
        <CartDrawer />
        {children}
        {tenant?.whatsappFloatingButton && tenant.whatsappNumber && (
          <WhatsAppFloat number={tenant.whatsappNumber} />
        )}
        <Footer
          tenantName={tenant?.name ?? ''}
          whatsappNumber={tenant?.whatsappNumber ?? null}
          address={tenant?.address ?? null}
          email={tenant?.email ?? ''}
          socialLinks={tenant?.socialLinks ?? []}
        />
        <Toaster />
      </body>
    </html>
  )
}
