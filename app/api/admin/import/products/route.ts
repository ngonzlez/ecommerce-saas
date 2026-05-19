import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { read, utils } from 'xlsx'
import slugify from 'slugify'
import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase-server'
import type { Prisma } from '@/lib/generated/prisma/client'

async function getAdminTenant(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const host = request.headers.get('host') ?? ''
  const { getSlugFromHost, getAdminTenantLean } = await import('@/lib/tenant')
  const slug = getSlugFromHost(host)
  const tenant = await getAdminTenantLean(slug)
  if (!tenant || tenant.email !== user.email) return null
  return tenant
}

function makeSlug(name: string) {
  return slugify(name, { lower: true, strict: true, locale: 'es' })
}

async function resolveCategory(
  name: string,
  tenantId: string,
  cache: Map<string, string>,
): Promise<string | null> {
  if (!name?.trim()) return null
  const key = name.trim().toLowerCase()
  if (cache.has(key)) return cache.get(key)!
  const slug = makeSlug(name.trim())
  const cat = await db.category.upsert({
    where: { tenantId_slug: { tenantId, slug } },
    update: {},
    create: { tenantId, name: name.trim(), slug },
  })
  cache.set(key, cat.id)
  return cat.id
}

async function makeUniqueSlug(base: string, tenantId: string): Promise<string> {
  const base_slug = makeSlug(base)
  let attempt = 0
  while (true) {
    const candidate = attempt === 0 ? base_slug : `${base_slug}-${attempt + 1}`
    const existing = await db.product.findFirst({ where: { tenantId, slug: candidate }, select: { id: true } })
    if (!existing) return candidate
    attempt++
  }
}

type RowError = { row: number; reason: string }

type PlainProduct = Prisma.ProductCreateManyInput
type ProductWithBadge = { name: string; data: Record<string, unknown> }

export async function POST(request: Request) {
  const tenant = await getAdminTenant(request)
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No se envió archivo' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const workbook = read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows = utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })

  const categoryCache = new Map<string, string>()
  const errors: RowError[] = []
  const plain: PlainProduct[] = []
  const withBadge: ProductWithBadge[] = []

  for (let i = 0; i < rawRows.length; i++) {
    const rowNum = i + 2
    const row = rawRows[i]

    const nombre = String(row['nombre'] ?? '').trim()
    if (!nombre) {
      errors.push({ row: rowNum, reason: 'nombre requerido' })
      continue
    }

    const precioRaw = String(row['precio'] ?? '').replace(/\D/g, '')
    const precio = parseInt(precioRaw, 10)
    if (!precioRaw || isNaN(precio) || precio < 0) {
      errors.push({ row: rowNum, reason: 'precio inválido' })
      continue
    }

    const comparacionRaw = String(row['precio_comparacion'] ?? '').replace(/\D/g, '')
    const comparePrice = comparacionRaw ? parseInt(comparacionRaw, 10) : null

    const stockRaw = String(row['stock'] ?? '').replace(/\D/g, '')
    const stock = stockRaw ? parseInt(stockRaw, 10) : 0

    const activo = String(row['activo'] ?? 'true').trim().toLowerCase()
    const active = activo !== 'false' && activo !== '0' && activo !== 'no'

    const destacado = String(row['destacado'] ?? 'false').trim().toLowerCase()
    const featured = destacado === 'true' || destacado === '1' || destacado === 'si'

    let categoryId: string | null = null
    try {
      categoryId = await resolveCategory(String(row['categoria'] ?? ''), tenant.id, categoryCache)
    } catch {
      errors.push({ row: rowNum, reason: 'error al crear categoría' })
      continue
    }

    const images: string[] = []
    for (let n = 1; n <= 5; n++) {
      const url = String(row[`imagen_${n}`] ?? '').trim()
      if (url) images.push(url)
    }

    const slug = await makeUniqueSlug(nombre, tenant.id)
    const sku = String(row['sku'] ?? '').trim() || null
    const description = String(row['descripcion'] ?? '').trim() || null
    const badgeText = String(row['badge_texto'] ?? '').trim()
    const badgeColor = String(row['badge_color'] ?? '').trim()

    const base = {
      name: nombre,
      slug,
      description,
      price: precio,
      comparePrice: comparePrice ?? null,
      stock,
      showStock: false,
      trackStock: false,
      sku,
      images,
      featured,
      active,
      categoryId,
    }

    if (badgeText) {
      withBadge.push({
        name: nombre,
        data: {
          tenantId: tenant.id,
          ...base,
          badge: { create: { text: badgeText, color: badgeColor || 'black', type: 'custom' } },
        },
      })
    } else {
      plain.push({ tenantId: tenant.id, ...base })
    }
  }

  let inserted = 0
  const CHUNK = 500

  // Batch insert plain products
  for (let start = 0; start < plain.length; start += CHUNK) {
    const chunk = plain.slice(start, start + CHUNK)
    try {
      const result = await db.product.createMany({ data: chunk, skipDuplicates: true })
      inserted += result.count
    } catch {
      errors.push({ row: start + 2, reason: `error en lote (filas ${start + 2}–${start + chunk.length + 1})` })
    }
  }

  // Individual inserts for products with badge
  for (const item of withBadge) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.product.create({ data: item.data as any })
      inserted++
    } catch {
      errors.push({ row: 0, reason: `error al insertar "${item.name}"` })
    }
  }

  revalidateTag(`tenant-${tenant.slug}`, 'default')

  return NextResponse.json({ total: rawRows.length, inserted, errors })
}
