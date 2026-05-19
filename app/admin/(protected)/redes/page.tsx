'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface SocialLink {
  id?: string
  platform: string
  url: string
  enabled: boolean
  order: number
}

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/tupagina' },
  { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/tuusuario' },
  { value: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@tuusuario' },
  { value: 'x', label: 'X (Twitter)', placeholder: 'https://x.com/tuusuario' },
  { value: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@tucanal' },
  { value: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/595XXXXXXXXX' },
]

const inputCls = 'flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400'

export default function RedesPage() {
  const [links, setLinks] = useState<SocialLink[]>(
    PLATFORMS.map((p, i) => ({ platform: p.value, url: '', enabled: false, order: i }))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/social').then(r => r.json()).then((data: SocialLink[]) => {
      const merged = PLATFORMS.map((p, i) => {
        const existing = data.find(d => d.platform === p.value)
        return existing ? { ...existing } : { platform: p.value, url: '', enabled: false, order: i }
      })
      setLinks(merged)
      setLoading(false)
    })
  }, [])

  function update(platform: string, field: keyof SocialLink, value: string | boolean | number) {
    setLinks(prev => prev.map(l => l.platform === platform ? { ...l, [field]: value } : l))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/admin/social', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(links),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      toast.error(d.error ?? 'Error al guardar')
    } else {
      setSaved(true)
      toast.success('Guardado correctamente')
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Redes Sociales</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-800 text-white text-sm px-5 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>

      <div className="space-y-3">
        {links.map((link) => {
          const platform = PLATFORMS.find(p => p.value === link.platform)!
          return (
            <div key={link.platform} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-28 flex-shrink-0">
                  <p className="font-medium text-gray-800 text-sm">{platform.label}</p>
                </div>
                <input
                  type="url"
                  className={inputCls}
                  value={link.url}
                  onChange={e => update(link.platform, 'url', e.target.value)}
                  placeholder={platform.placeholder}
                />
                <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={link.enabled}
                    onChange={e => update(link.platform, 'enabled', e.target.checked)}
                    className="rounded"
                  />
                  <span className={`text-sm font-medium ${link.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                    {link.enabled ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-800 text-white text-sm px-5 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
