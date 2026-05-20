import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import { createClient } from '@/lib/supabase-server'
import { db } from '@/lib/db'
import CheckoutForm from '@/components/storefront/CheckoutForm'

export default async function CheckoutPage() {
  const headersList = await headers()
  const slug = headersList.get('x-tenant-slug') ?? getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let customerPrefill: { name: string; lastName: string; email: string; phone: string; address: string } | null = null
  if (user?.email) {
    const customer = await db.customer.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: user.email } },
    })
    if (customer) {
      const parts = customer.name.split(' ')
      customerPrefill = {
        name: parts[0] ?? '',
        lastName: parts.slice(1).join(' '),
        email: customer.email,
        phone: customer.phone ?? '',
        address: customer.address ?? '',
      }
    } else {
      customerPrefill = {
        name: '', lastName: '', email: user.email, phone: '', address: '',
      }
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-8">Finalizar pedido</h1>
        <CheckoutForm
          shippingMethods={tenant.shippingMethods}
          paymentMethods={tenant.paymentMethods}
          tenantName={tenant.name}
          customerPrefill={customerPrefill}
        />
      </div>
    </main>
  )
}
