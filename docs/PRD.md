# PRD — Ecommerce SaaS Multi-Tenant

## Descripción del Producto

Plataforma SaaS de ecommerce para comercios paraguayos. Un solo deployment sirve a N comercios, cada uno con su subdominio propio (`comercio.tuapp.com`), diseño completamente configurable y panel de administración autoadministrable. El comercio no necesita contratar desarrolladores para gestionar productos, pedidos, banners o diseño.

---

## Objetivos de Negocio

- Construir una vez, vender a N comercios (recurrente)
- Eliminar dependencia de WordPress/WooCommerce (sin comprar temas)
- Cada comercio: autoadministrable sin conocimientos técnicos
- Facturación en guaraníes, medios de pago locales (Pagopar, Tigo, transferencia bancaria)

---

## Usuarios

| Rol | Descripción |
|-----|------------|
| **Super-Admin** | Gestiona todos los tenants. Crea, edita, suspende comercios. |
| **Admin Comercio** | Gestiona su tienda: productos, pedidos, diseño, config. |
| **Cliente Final** | Navega, busca, compra. Puede registrarse o comprar como guest. |

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Base de datos | Supabase (Postgres) |
| ORM | Prisma |
| Auth | Supabase Auth |
| Storage | Supabase Storage (imágenes productos, logos, banners) |
| Emails | Resend + React Email |
| Estilos | Tailwind CSS + shadcn/ui |
| Animaciones | Framer Motion |
| Hosting | Vercel (wildcard subdomains) |
| Pagos | Pagopar, Tigo Money, Transferencia Bancaria, Efectivo |
| Estado cliente | Zustand (carrito) |
| Control de versiones | GitHub (`github.com/ngnzalez/ecommerce-saas`) |

---

## Arquitectura Multi-Tenant

Cada comercio vive en `{slug}.tuapp.com`. El `middleware.ts` de Next.js intercepta cada request, lee el subdominio, busca el tenant en la DB y pasa la configuración al contexto de la app.

```
comercio1.tuapp.com  ──► middleware ──► tenant: comercio1 ──► su data y diseño
comercio2.tuapp.com  ──► middleware ──► tenant: comercio2 ──► su data y diseño
admin.tuapp.com      ──► super-admin panel
```

Los colores del tenant se inyectan como CSS custom properties en `<html>` desde el middleware, permitiendo que toda la UI respete la identidad visual del comercio sin JS adicional.

```css
/* Inyectado por el middleware según el tenant */
--color-primary: #e63946;
--color-secondary: #f1faee;
```

---

## Schema de Base de Datos

```prisma
model Tenant {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  domain      String?  @unique
  // Branding
  primaryColor   String @default("#000000")
  secondaryColor String @default("#ffffff")
  logoUrl        String?
  faviconUrl     String?
  homeTemplate   String @default("grid") // "grid"|"hero"|"minimal"|"magazine"
  // Contacto
  whatsappNumber String?
  email          String
  address        String?
  // Config checkout
  requireRegistration    Boolean @default(false)
  allowGuestCheckout     Boolean @default(true)
  whatsappFloatingButton Boolean @default(true)
  // Relaciones
  products       Product[]
  categories     Category[]
  orders         Order[]
  banners        Banner[]
  marqueeTexts   MarqueeText[]
  shippingMethods ShippingMethod[]
  paymentMethods  PaymentMethodConfig[]
  socialLinks     SocialLink[]
  coupons         Coupon[]
  customers       Customer[]
  createdAt      DateTime @default(now())
}

model SocialLink {
  id       String  @id @default(cuid())
  tenantId String
  tenant   Tenant  @relation(fields: [tenantId], references: [id])
  platform String  // "facebook"|"instagram"|"tiktok"|"x"|"youtube"|"whatsapp"
  url      String
  enabled  Boolean @default(true)
  order    Int     @default(0)
}

model ShippingMethod {
  id          String  @id @default(cuid())
  tenantId    String
  tenant      Tenant  @relation(fields: [tenantId], references: [id])
  name        String  // ej: "Delivery Asunción", "Retirar en Tienda Lambaré"
  description String? // ej: "Aproximadamente en 1/2 días hábiles"
  type        String  // "pickup" | "delivery"
  price       Int     @default(0) // en guaraníes, 0 = gratis
  enabled     Boolean @default(true)
  order       Int     @default(0)
  orders      Order[]
}

model PaymentMethodConfig {
  id       String  @id @default(cuid())
  tenantId String
  tenant   Tenant  @relation(fields: [tenantId], references: [id])
  type     String  // "transfer"|"pagopar"|"whatsapp"|"cash"|"tigo"
  label    String  // ej: "Transferencia Bancaria"
  details  String? // datos bancarios, instrucciones (texto libre)
  enabled  Boolean @default(false)
  order    Int     @default(0)
}

model Coupon {
  id             String    @id @default(cuid())
  tenantId       String
  tenant         Tenant    @relation(fields: [tenantId], references: [id])
  code           String
  type           String    // "percentage" | "fixed"
  value          Int       // 20 = 20% ó 50000 = ₲50.000
  minOrderAmount Int?
  maxUses        Int?
  usedCount      Int       @default(0)
  expiresAt      DateTime?
  enabled        Boolean   @default(true)
  orders         Order[]
  @@unique([tenantId, code])
}

model Product {
  id           String   @id @default(cuid())
  tenantId     String
  tenant       Tenant   @relation(fields: [tenantId], references: [id])
  name         String
  slug         String
  description  String?
  price        Int      // en guaraníes
  comparePrice Int?     // precio viejo tachado
  stock        Int      @default(0)
  showStock    Boolean  @default(false)
  sku          String?
  images       String[] // URLs en Supabase Storage
  featured     Boolean  @default(false)
  categoryId   String?
  category     Category? @relation(fields: [categoryId], references: [id])
  badge        ProductBadge?
  orderItems   OrderItem[]
  favorites    Favorite[]
  createdAt    DateTime @default(now())
  @@unique([tenantId, slug])
}

model ProductBadge {
  id        String  @id @default(cuid())
  productId String  @unique
  product   Product @relation(fields: [productId], references: [id])
  text      String  // ej: "25%", "TOP PRODUCT", "NUEVO"
  color     String  // "red"|"green"|"blue"|"orange"|"black"
  type      String  // "discount"|"custom"
}

model Category {
  id       String    @id @default(cuid())
  tenantId String
  tenant   Tenant    @relation(fields: [tenantId], references: [id])
  name     String
  slug     String
  imageUrl String?
  products Product[]
  @@unique([tenantId, slug])
}

model Banner {
  id       String  @id @default(cuid())
  tenantId String
  tenant   Tenant  @relation(fields: [tenantId], references: [id])
  type     String  // "hero"|"info"|"offers"
  imageUrl String?
  title    String?
  subtitle String?
  linkUrl  String?
  order    Int     @default(0)
  enabled  Boolean @default(true)
}

model MarqueeText {
  id       String  @id @default(cuid())
  tenantId String
  tenant   Tenant  @relation(fields: [tenantId], references: [id])
  text     String
  order    Int     @default(0)
  enabled  Boolean @default(true)
}

model Customer {
  id       String  @id @default(cuid())
  tenantId String
  tenant   Tenant  @relation(fields: [tenantId], references: [id])
  userId   String? // Supabase Auth user ID, null si guest
  name     String
  email    String
  phone    String?
  address  String?
  orders   Order[]
  favorites Favorite[]
  @@unique([tenantId, email])
}

model Favorite {
  id         String   @id @default(cuid())
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id])
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  @@unique([customerId, productId])
}

model Order {
  id         String  @id @default(cuid())
  tenantId   String
  tenant     Tenant  @relation(fields: [tenantId], references: [id])
  orderNumber String @unique
  // Cliente
  customerId String?
  customer   Customer? @relation(fields: [customerId], references: [id])
  guestName  String?
  guestEmail String?
  guestPhone String?
  // Envío
  shippingMethodId   String?
  shippingMethod     ShippingMethod? @relation(fields: [shippingMethodId], references: [id])
  shippingMethodName String?
  shippingPrice      Int @default(0)
  deliveryAddress    String?
  // Pago
  paymentMethod String?
  paymentStatus String  @default("pending") // "pending"|"paid"|"failed"
  // Descuento
  couponId       String?
  coupon         Coupon? @relation(fields: [couponId], references: [id])
  couponCode     String?
  discountAmount Int     @default(0)
  // Totales
  subtotal Int
  total    Int
  // Instrucciones del cliente
  notes String?
  // Estado
  status String @default("pending") // "pending"|"confirmed"|"shipped"|"delivered"|"cancelled"
  items  OrderItem[]
  createdAt DateTime @default(now())
}

model OrderItem {
  id           String  @id @default(cuid())
  orderId      String
  order        Order   @relation(fields: [orderId], references: [id])
  productId    String
  product      Product @relation(fields: [productId], references: [id])
  productName  String
  productImage String?
  quantity     Int
  price        Int
}
```

---

## Features por Módulo

### Tienda Pública

**Home (secciones configurables por admin):**
- Banner Hero carousel (imágenes fullwidth con título/CTA)
- Marquee ticker animado (textos configurables en loop)
- Banner Info (franja informativa)
- Categorías destacadas
- Productos destacados (featured=true)
- Sector Ofertas (productos con comparePrice)
- Sección Split (imagen izquierda + texto/CTA derecha)
- Grid Editorial (texto izquierda + mosaico fotos derecha)

**Catálogo:**
- Grid de productos con filtros por categoría
- Búsqueda en tiempo real con debounce
- ProductCard: badge de color configurable, precio tachado, % descuento, stock, carousel imágenes, favorito

**Detalle producto:**
- Galería con carousel dots
- Precio actual + precio tachado + badge descuento
- Stock visible si `showStock=true`
- Botón "Agregar al carrito" + "Favorito"

**Carrito:**
- Drawer slide-in al agregar
- Página `/carrito`: tabla ítems, qty +/−, eliminar
- Textarea instrucciones especiales
- Campo cupón de descuento
- Resumen con subtotal/descuento/total

**Checkout (layout dos columnas — referencia JRPack):**
- Columna izq: contacto, datos personales, lista radio de métodos de envío, lista radio de métodos de pago con detalles, dirección facturación
- Columna der (sticky): ítems del pedido, campo cupón, subtotal/descuento/envío/total
- Total actualiza en tiempo real al cambiar método de envío
- Botón "Finalizar el pedido"

**Confirmación:**
- Página `/pedido/[orderNumber]` con resumen completo e instrucciones de pago

### Auth y Perfil

- Registro/Login para clientes (Supabase Auth)
- Guest checkout (sin cuenta) — según config del tenant
- Toggle por tenant: obligar registro o no
- `/mi-cuenta`: editar datos personales
- `/mi-cuenta/pedidos`: historial + detalle con estado actual
- `/favoritos`: grid de productos guardados

### Emails (Resend + React Email)

**Al cliente:** confirmación con ítems, totales, método envío, instrucciones de pago, link al pedido
**Al comercio:** datos del cliente, ítems, método de envío, método de pago

### Admin Panel

| Módulo | Descripción |
|--------|------------|
| Dashboard | Stats: pedidos del día/mes, revenue, últimos pedidos |
| Productos | CRUD + upload múltiples imágenes + badge editor + comparePrice + showStock + featured |
| Categorías | CRUD + imagen de categoría |
| Pedidos | Lista filtrable, detalle, cambiar estado |
| Cupones | Crear/editar cupones: código, % o fijo, mínimo, vencimiento, usos máximos |
| Métodos de Envío | Lista plana: nombre, descripción, tipo (pickup/delivery), precio, orden |
| Métodos de Pago | Activar tipos, ingresar datos bancarios/instrucciones por tipo |
| Banners | CRUD por tipo (hero/info/ofertas), ordenar, activar/desactivar |
| Marquee | Agregar/editar textos del ticker, ordenar |
| Diseño | Color picker, logo/favicon upload, elegir home template |
| Redes Sociales | URL por red (FB/IG/TikTok/X/YT/WA), toggle, ordenar, toggle botón flotante WA |
| Config Tienda | Nombre, dirección, WA, email notificaciones, toggle obligar registro |

### Super-Admin

- CRUD tenants (crear comercio, editar, suspender)
- Ver actividad de todos los comercios

---

## Estructura de Archivos Next.js

```
/app
  /[domain]                          ← catch-all por subdominio
    /page.tsx                        ← Home dinámico
    /productos
      /page.tsx                      ← Catálogo + búsqueda + filtros
      /[slug]/page.tsx               ← Detalle producto
    /carrito/page.tsx
    /checkout/page.tsx
    /pedido/[orderNumber]/page.tsx
    /favoritos/page.tsx
    /mi-cuenta
      /page.tsx
      /pedidos/page.tsx
      /pedidos/[orderNumber]/page.tsx
    /login/page.tsx
    /registro/page.tsx
    /admin
      /page.tsx                      ← Dashboard
      /productos/page.tsx
      /categorias/page.tsx
      /pedidos/page.tsx
      /cupones/page.tsx
      /envios/page.tsx
      /pagos/page.tsx
      /banners/page.tsx
      /marquee/page.tsx
      /diseno/page.tsx
      /redes/page.tsx
      /config/page.tsx
  /api
    /orders/route.ts
    /coupons/validate/route.ts
    /favorites/route.ts
    /products/search/route.ts
/middleware.ts
/lib
  /tenant.ts
  /email.ts
  /pagopar.ts
  /coupon.ts
/components
  /templates
    /HomeGrid.tsx
    /HomeHero.tsx
    /HomeMinimal.tsx
    /HomeMagazine.tsx
  /home
    /HeroBannerCarousel.tsx
    /MarqueeTicker.tsx
    /InfoBanner.tsx
    /OffersSection.tsx
    /SplitSection.tsx
    /EditorialGrid.tsx
  /storefront
    /ProductCard.tsx
    /ProductBadge.tsx
    /ProductSearch.tsx
    /CategoryFilter.tsx
    /CartDrawer.tsx
    /CartPage.tsx
    /CheckoutForm.tsx
    /ShippingMethodList.tsx
    /PaymentMethodList.tsx
    /CouponInput.tsx
    /OrderSummary.tsx
    /FavoriteButton.tsx
    /SocialLinks.tsx
    /WhatsAppFloat.tsx
  /admin
    /ProductForm.tsx
    /BadgeEditor.tsx
    /CouponForm.tsx
    /ShippingMethodForm.tsx
    /BannerManager.tsx
    /MarqueeManager.tsx
    /DesignPanel.tsx
    /ColorPicker.tsx
/prisma
  /schema.prisma
  /seed.ts
```

---

## Variables de Entorno

```env
# Supabase
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Emails
RESEND_API_KEY=re_...

# Pagos
PAGOPAR_TOKEN=...
PAGOPAR_PUBLIC_KEY=...

# App
NEXT_PUBLIC_APP_DOMAIN=tuapp.com
```

---

## Roadmap

**Fase 1** — Base + Tienda pública completa + Checkout + Emails + Git/GitHub
**Fase 2** — Auth cliente + Guest checkout + Favoritos + Perfil
**Fase 3** — Panel Admin completo
**Fase 4** — Templates adicionales + Pagopar + Super-admin + SEO + Deploy
