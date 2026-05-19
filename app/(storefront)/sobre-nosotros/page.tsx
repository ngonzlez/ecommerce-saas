import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import { MapPin, Mail, Phone } from 'lucide-react'

export default async function SobreNosotrosPage() {
  const headersList = await headers()
  const slug = getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Hero */}
        <div
          className="rounded-3xl p-10 text-white text-center mb-10"
          style={{ background: `linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, black))` }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{tenant.name}</h1>
          <p className="text-white/80 text-lg">Tienda online en Paraguay</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-3">¿Quiénes somos?</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {tenant.aboutText ?? `Somos ${tenant.name}, una tienda dedicada a ofrecerte los mejores productos con la comodidad de comprar desde casa. Trabajamos cada día para brindarte una experiencia de compra segura, rápida y confiable.`}
            </p>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Información de contacto</h2>
            <div className="space-y-3">
              {tenant.address && (
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                  <span>{tenant.address}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} className="shrink-0" style={{ color: 'var(--color-primary)' }} />
                <a href={`mailto:${tenant.email}`} className="hover:underline">{tenant.email}</a>
              </div>
              {tenant.whatsappNumber && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={18} className="shrink-0" style={{ color: 'var(--color-primary)' }} />
                  <a href={`https://wa.me/${tenant.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    +{tenant.whatsappNumber}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
