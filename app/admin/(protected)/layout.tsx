import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getTenantBySlug, getSlugFromHost } from '@/lib/tenant'
import AdminSidebar from '@/components/admin/AdminSidebar'

async function getAdminSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const host = h.get('host') ?? ''
  const slug = h.get('x-tenant-slug') ?? getSlugFromHost(host)
  const [tenant, user] = await Promise.all([getTenantBySlug(slug), getAdminSession()])

  if (!user || user.email !== tenant?.email) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar tenantName={tenant?.name ?? slug} />
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{tenant?.name ?? slug}</span>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
