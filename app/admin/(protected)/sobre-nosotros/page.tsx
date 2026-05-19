'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function SobreNosotrosAdminPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/about')
      .then(r => r.json())
      .then(data => {
        setText(data.aboutText ?? '')
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/admin/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aboutText: text }),
    })
    if (res.ok) {
      toast.success('Guardado correctamente')
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Error al guardar')
    }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sobre Nosotros</h1>
          <p className="text-sm text-gray-500 mt-0.5">Texto que aparece en la página "¿Quiénes somos?" de la tienda</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-800 text-white text-sm px-5 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Texto de presentación
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={12}
          placeholder="Somos una tienda dedicada a ofrecerte los mejores productos..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-y"
        />
        <p className="text-xs text-gray-400 mt-2">Se mostrará en la sección "¿Quiénes somos?" de tu tienda.</p>
      </div>
    </div>
  )
}
