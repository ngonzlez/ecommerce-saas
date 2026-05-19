import { headers } from 'next/headers'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat'
import CartDrawer from '@/components/storefront/CartDrawer'
import AnnouncementBar from '@/components/layout/AnnouncementBar'

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const slug = headersList.get('x-tenant-slug') ?? getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await getTenantBySlug(slug)

  const primaryColor = tenant?.primaryColor ?? '#000000'
  const secondaryColor = tenant?.secondaryColor ?? '#ffffff'

  const infoBanner = tenant?.banners.find(b => b.type === 'info' && b.enabled) ?? null

  return (
    <div
      style={
        {
          '--color-primary': primaryColor,
          '--color-secondary': secondaryColor,
        } as React.CSSProperties
      }
      className="min-h-full flex flex-col"
    >
      {infoBanner?.title && (
        <AnnouncementBar
          title={infoBanner.title}
          linkUrl={infoBanner.linkUrl}
          linkText={infoBanner.linkText}
        />
      )}
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
        contactNumbers={tenant?.contactNumbers ?? []}
        branches={tenant?.branches ?? []}
      />
    </div>
  )
}
