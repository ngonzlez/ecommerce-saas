import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  const slug = process.env.TENANT_SLUG ?? 'mi-tienda'
  const email = process.env.TENANT_EMAIL ?? 'admin@mi-tienda.com'
  const name = process.env.TENANT_NAME ?? 'Mi Tienda'

  await db.tenant.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      name,
      email,
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      whatsappFloatingButton: false,
    },
  })

  console.log(`✅ Tenant creado — slug: ${slug}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
