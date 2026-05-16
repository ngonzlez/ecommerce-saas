import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tienda Online',
  description: 'Tienda online',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const slug = headersList.get('x-tenant-slug') ?? 'demo'
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
        {children}
        <Toaster />
      </body>
    </html>
  )
}
