import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  const tenant = await db.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      slug: 'demo',
      name: 'Mi Tienda Demo',
      email: 'demo@tienda.com',
      primaryColor: '#e63946',
      secondaryColor: '#f1faee',
      whatsappNumber: '595981234567',
      address: 'Asunción, Paraguay',
      whatsappFloatingButton: true,
      marqueeTexts: {
        create: [
          { text: 'ENVÍOS A TODO EL PAÍS', order: 0 },
          { text: 'PAGOS SEGUROS', order: 1 },
          { text: 'ATENCIÓN AL CLIENTE 24/7', order: 2 },
        ],
      },
      shippingMethods: {
        create: [
          { name: 'Retirar en local', description: 'Lunes a Viernes 8:00 - 17:00', type: 'pickup', price: 0, order: 0 },
          { name: 'Delivery Asunción', description: 'Aproximadamente en 1/2 días hábiles', type: 'delivery', price: 20000, order: 1 },
          { name: 'Delivery Gran Asunción', description: 'Aproximadamente en 1/2 días hábiles', type: 'delivery', price: 30000, order: 2 },
          { name: 'Interior del País', description: 'Aproximadamente en 2/3 días hábiles', type: 'delivery', price: 50000, order: 3 },
        ],
      },
      paymentMethods: {
        create: [
          {
            type: 'transfer',
            label: 'Transferencia Bancaria',
            details: 'Banco: Itaú\nCuenta: 123456789\nTitular: Mi Tienda Demo SA\nRUC: 80001234-5\n\nEnviá el comprobante por WhatsApp.',
            enabled: true,
            order: 0,
          },
          {
            type: 'tigo',
            label: 'Giros Tigo',
            details: 'Número: 0981 234 567\nTitular: Juan Pérez\n\nEnviá el comprobante por WhatsApp.',
            enabled: true,
            order: 1,
          },
          { type: 'whatsapp', label: 'Coordinar por WhatsApp', details: null, enabled: true, order: 2 },
          { type: 'cash', label: 'Efectivo al retirar', details: 'Pagás al momento de retirar en el local.', enabled: true, order: 3 },
        ],
      },
      socialLinks: {
        create: [
          { platform: 'instagram', url: 'https://instagram.com/mitiendademo', order: 0 },
          { platform: 'facebook', url: 'https://facebook.com/mitiendademo', order: 1 },
          { platform: 'whatsapp', url: 'https://wa.me/595981234567', order: 2 },
        ],
      },
    },
  })

  // Categories
  const [cat1, cat2] = await Promise.all([
    db.category.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: 'electronica' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Electrónica', slug: 'electronica' },
    }),
    db.category.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: 'hogar' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Hogar', slug: 'hogar' },
    }),
  ])

  // Products
  const products = [
    {
      name: 'Licuadora Premium 1000W',
      slug: 'licuadora-premium-1000w',
      description: 'Potente licuadora de 1000W con vaso de vidrio templado de 1.5L. Ideal para smoothies, jugos y batidos. 5 velocidades + función pulse. Cuchillas de acero inoxidable de alta resistencia. Fácil de limpiar y de uso diario.',
      price: 225000,
      comparePrice: 300000,
      stock: 15,
      showStock: true,
      featured: true,
      categoryId: cat1.id,
      badge: { text: '25%', color: 'red', type: 'discount' },
    },
    {
      name: 'Auriculares Bluetooth Pro',
      slug: 'auriculares-bluetooth-pro',
      description: 'Auriculares inalámbricos con cancelación activa de ruido (ANC). Hasta 30hs de batería, carga rápida USB-C. Sonido Hi-Fi con bajos profundos. Compatible con iOS y Android. Incluye estuche rígido y cable auxiliar.',
      price: 180000,
      comparePrice: null,
      stock: 8,
      showStock: true,
      featured: true,
      categoryId: cat1.id,
      badge: { text: 'TOP PRODUCT', color: 'green', type: 'custom' },
    },
    {
      name: 'Set de Sartenes Antiadherentes',
      slug: 'set-sartenes-antiadherentes',
      description: 'Set de 3 sartenes (20, 24 y 28 cm) con recubrimiento antiadherente de granito libre de PFOA. Apto para todo tipo de cocinas incluyendo inducción. Mango ergonómico que no se calienta. Fácil limpieza, apta para lavavajillas.',
      price: 95000,
      comparePrice: 130000,
      stock: 20,
      showStock: false,
      featured: true,
      categoryId: cat2.id,
      badge: null,
    },
    {
      name: 'Cafetera Espresso Automática',
      slug: 'cafetera-espresso-automatica',
      description: 'Cafetera espresso totalmente automática con molinillo integrado. Presión de 15 bares para un espresso perfecto. Pantalla LCD con 6 programas preconfigurados. Depósito de agua de 1.8L. Incluye vaporizador para espumar leche.',
      price: 350000,
      comparePrice: null,
      stock: 5,
      showStock: true,
      featured: false,
      categoryId: cat2.id,
      badge: { text: 'NUEVO', color: 'blue', type: 'custom' },
    },
  ]

  for (const p of products) {
    const { badge, ...productData } = p
    const product = await db.product.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: p.slug } },
      update: {},
      create: { tenantId: tenant.id, ...productData },
    })
    if (badge) {
      await db.productBadge.upsert({
        where: { productId: product.id },
        update: {},
        create: { productId: product.id, ...badge },
      })
    }
  }

  // Coupon
  await db.coupon.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'BIENVENIDO10' } },
    update: {},
    create: {
      tenantId: tenant.id,
      code: 'BIENVENIDO10',
      type: 'percentage',
      value: 10,
      minOrderAmount: 50000,
      enabled: true,
    },
  })

  console.log('✅ Seed completado — tenant: demo')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
