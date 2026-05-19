'use client'

import { useRef, useState } from 'react'
import { Upload, FileDown, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

type ImportResult = {
  total: number
  inserted: number
  errors: { row: number; reason: string }[]
}

export default function ImportarProductosPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setResult(null)
    setError('')
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/import/products', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al importar')
      } else {
        setResult(data)
      }
    } catch {
      setError('Error de conexión. Intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Importar Productos</h1>
      <p className="text-sm text-gray-500 mb-6">
        Subí tu planilla Excel (.xlsx) o CSV con los productos. Máximo 5000 filas.
      </p>

      {/* Template download */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-800">Paso 1 — Descargá la plantilla</p>
          <p className="text-xs text-blue-600 mt-0.5">Completá con tus productos y subí el archivo</p>
        </div>
        <a
          href="/api/admin/import/products/template"
          download="plantilla-productos.csv"
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <FileDown size={15} />
          Descargar plantilla
        </a>
      </div>

      {/* File upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4 hover:border-slate-400 transition-colors">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload size={28} className="mx-auto text-gray-400 mb-3" />
        {file ? (
          <div>
            <p className="text-sm font-medium text-gray-800">{file.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Ningún archivo seleccionado</p>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 text-sm text-slate-700 font-medium underline underline-offset-2"
        >
          Seleccionar archivo
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-slate-800 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Importando...
          </>
        ) : (
          <>
            <Upload size={15} />
            Paso 2 — Importar productos
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{result.total}</p>
              <p className="text-xs text-gray-500 mt-0.5">Filas leídas</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{result.inserted}</p>
              <p className="text-xs text-green-600 mt-0.5">Importados</p>
            </div>
            <div className={`rounded-xl p-4 text-center border ${result.errors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-2xl font-bold ${result.errors.length > 0 ? 'text-red-700' : 'text-gray-900'}`}>
                {result.errors.length}
              </p>
              <p className={`text-xs mt-0.5 ${result.errors.length > 0 ? 'text-red-600' : 'text-gray-500'}`}>Errores</p>
            </div>
          </div>

          {result.inserted > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle size={15} />
              {result.inserted} producto{result.inserted !== 1 ? 's' : ''} importado{result.inserted !== 1 ? 's' : ''} correctamente
            </div>
          )}

          {result.errors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm text-red-700 mb-2">
                <AlertCircle size={15} />
                Filas con error ({result.errors.length})
              </div>
              <div className="border border-red-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-red-50 border-b border-red-200">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-red-700 w-20">Fila</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-red-700">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((e, i) => (
                      <tr key={i} className="border-b border-red-100 last:border-0">
                        <td className="px-4 py-2 text-red-800 font-mono">{e.row}</td>
                        <td className="px-4 py-2 text-red-700">{e.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
