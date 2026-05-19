import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import { db } from '@/lib/db'

export default async function PrivacyPage() {
  const headersList = await headers()
  const slug = headersList.get('x-tenant-slug') ?? getSlugFromHost(headersList.get('host') ?? '')
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const data = await db.tenant.findUnique({
    where: { id: tenant.id },
    select: { privacyPolicy: true },
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Política de Privacidad</h1>
        <div className="bg-white rounded-2xl border p-8">
          {data?.privacyPolicy ? (
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-sm">
              {data.privacyPolicy}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">Política de privacidad no configurada aún.</p>
          )}
        </div>
      </div>
    </main>
  )
}
