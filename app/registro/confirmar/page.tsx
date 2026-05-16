import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function ConfirmarPage() {
  return (
    <main className="pt-14 md:pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="bg-white rounded-2xl border p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <Mail size={32} className="text-green-500" />
          </div>
          <h1 className="text-xl font-bold">Revisá tu email</h1>
          <p className="text-sm text-gray-500">
            Te enviamos un link de confirmación. Hacé clic en el link para activar tu cuenta.
          </p>
          <Link href="/login" className="block text-sm font-medium hover:underline mt-2" style={{ color: 'var(--color-primary)' }}>
            Volver al login
          </Link>
        </div>
      </div>
    </main>
  )
}
