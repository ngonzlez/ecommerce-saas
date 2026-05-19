import { NextResponse } from 'next/server'

const HEADERS = [
  'nombre',
  'precio',
  'descripcion',
  'precio_comparacion',
  'stock',
  'sku',
  'categoria',
  'destacado',
  'activo',
  'badge_texto',
  'badge_color',
  'imagen_1',
  'imagen_2',
  'imagen_3',
  'imagen_4',
  'imagen_5',
]

const EXAMPLE = [
  'Remera Básica',
  '150000',
  'Remera de algodón 100%',
  '200000',
  '50',
  'REM-001',
  'Indumentaria',
  'false',
  'true',
  '',
  '',
  'https://ejemplo.com/imagen1.jpg',
  '',
  '',
  '',
  '',
]

export async function GET() {
  const rows = [HEADERS, EXAMPLE]
  const csv = rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\r\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="plantilla-productos.csv"',
    },
  })
}
