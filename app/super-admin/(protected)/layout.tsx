import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Building2, LogOut } from 'lucide-react'

async function getSuperAdminSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSuperAdminSession()
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL

  if (!user || (superAdminEmail && user.email !== superAdminEmail)) {
    redirect('/super-admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 flex flex-col border-r border-slate-800">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <Building2 size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">Super Admin</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/super-admin/tenants"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Building2 size={15} />
            Tenants
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 px-3 mb-2 truncate">{user.email}</p>
          <form action="/api/super-admin/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-4">
          <h1 className="text-sm font-semibold text-slate-300">Panel de administración global</h1>
        </header>
        <main className="flex-1 p-8 text-white">{children}</main>
      </div>
    </div>
  )
}
