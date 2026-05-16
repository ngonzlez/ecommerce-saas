import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantBySlug, getSlugFromHost, formatPrice } from '@/lib/tenant'
import CheckoutForm from '@/components/storefront/CheckoutForm'

export default async function CheckoutPage() {
  const headersList = await headers()
  const slug = getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  return (
    <main className="pt-14 md:pt-16 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-8">Finalizar pedido</h1>
        <CheckoutForm
          shippingMethods={tenant.shippingMethods}
          paymentMethods={tenant.paymentMethods}
          tenantName={tenant.name}
        />
      </div>
    </main>
  )
}
