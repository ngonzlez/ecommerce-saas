'use client'

import { useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'

interface DesignConfig {
  primaryColor: string
  secondaryColor: string
  logoUrl: string
  faviconUrl: string
  homeTemplate: string
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

const HOME_TEMPLATES = [
  { value: 'grid', label: 'Grid' },
  { value: 'hero', label: 'Hero' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'magazine', label: 'Magazine' },
]

export default function DisenoPage() {
  const [form, setForm] = useState<DesignConfig>({
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    logoUrl: '',
    faviconUrl: '',
    homeTemplate: 'grid',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)

  useEffect(() => {
    fetch('/api/admin/design').then(r => r.json()).then(data => {
      setForm(prev => ({
        ...prev,
        primaryColor: data.primaryColor ?? prev.primaryColor,
        secondaryColor: data.secondaryColor ?? prev.secondaryColor,
        logoUrl: data.logoUrl ?? prev.logoUrl,
        faviconUrl: data.faviconUrl ?? prev.faviconUrl,
        homeTemplate: data.homeTemplate ?? prev.homeTemplate,
      }))
      setLoading(false)
    })
  }, [])

  async function uploadFile(file: File, field: 'logoUrl' | 'faviconUrl', setUploading: (v: boolean) => void) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setForm(f => ({ ...f, [field]: data.url }))
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/admin/design', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
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
        <h1 className="text-xl font-bold text-gray-900">Diseño</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-800 text-white text-sm px-5 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Colores</h2>
          <div>
            <label className={labelCls}>Color primario</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={form.primaryColor}
                onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                className="h-9 w-12 rounded border border-gray-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                className={inputCls}
                maxLength={7}
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Color secundario</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={form.secondaryColor}
                onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))}
                className="h-9 w-12 rounded border border-gray-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={form.secondaryColor}
                onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))}
                className={inputCls}
                maxLength={7}
                placeholder="#ffffff"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Plantilla de inicio</label>
            <select className={inputCls} value={form.homeTemplate} onChange={e => setForm(f => ({ ...f, homeTemplate: e.target.value }))}>
              {HOME_TEMPLATES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Logo & Favicon */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Imágenes</h2>
          <div>
            <label className={labelCls}>Logo</label>
            <input
              className={inputCls + ' mb-2'}
              value={form.logoUrl}
              onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
              placeholder="URL del logo"
            />
            <label className="cursor-pointer flex items-center gap-2 text-sm text-slate-700 border border-dashed border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">
              <Upload size={14} />
              {uploadingLogo ? 'Subiendo...' : 'Subir logo'}
              <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'logoUrl', setUploadingLogo) }} />
            </label>
            {form.logoUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={form.logoUrl} alt="Logo" className="mt-3 h-12 object-contain border border-gray-200 rounded-lg p-1 bg-gray-50" />
            )}
          </div>
          <div>
            <label className={labelCls}>Favicon</label>
            <input
              className={inputCls + ' mb-2'}
              value={form.faviconUrl}
              onChange={e => setForm(f => ({ ...f, faviconUrl: e.target.value }))}
              placeholder="URL del favicon"
            />
            <label className="cursor-pointer flex items-center gap-2 text-sm text-slate-700 border border-dashed border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">
              <Upload size={14} />
              {uploadingFavicon ? 'Subiendo...' : 'Subir favicon'}
              <input type="file" accept="image/*" className="hidden" disabled={uploadingFavicon} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'faviconUrl', setUploadingFavicon) }} />
            </label>
            {form.faviconUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={form.faviconUrl} alt="Favicon" className="mt-3 h-8 w-8 object-contain border border-gray-200 rounded p-0.5 bg-gray-50" />
            )}
          </div>
        </div>
      </div>

      {/* Color preview */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-3">Vista previa</h2>
        <div className="flex gap-4 items-center">
          <div
            className="w-16 h-16 rounded-xl border border-gray-200"
            style={{ backgroundColor: form.primaryColor }}
          />
          <div>
            <p className="text-sm font-medium text-gray-700">Primario</p>
            <p className="text-xs text-gray-400 font-mono">{form.primaryColor}</p>
          </div>
          <div
            className="w-16 h-16 rounded-xl border border-gray-200"
            style={{ backgroundColor: form.secondaryColor }}
          />
          <div>
            <p className="text-sm font-medium text-gray-700">Secundario</p>
            <p className="text-xs text-gray-400 font-mono">{form.secondaryColor}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
