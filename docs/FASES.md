# Fases de Desarrollo — Ecommerce SaaS

Trabajar fase por fase. No avanzar a la siguiente sin completar la anterior. Cada fase cierra con PR a `main`.

---

## FASE 1 — Base + Tienda Pública + Checkout

> Objetivo: tienda funcional end-to-end. Cliente puede navegar, agregar al carrito, hacer un pedido y recibir email de confirmación.

### Setup Inicial

- [ ] Inicializar Next.js 15 con App Router + TypeScript (`pnpm create next-app`)
- [ ] Configurar Tailwind CSS + shadcn/ui
- [ ] Instalar dependencias: Prisma, @supabase/supabase-js, Resend, Framer Motion, Zustand, React Email
- [ ] Configurar Prisma + connection string de Supabase
- [ ] Escribir schema Prisma completo (ver PRD.md)
- [ ] Ejecutar migración inicial (`prisma migrate dev`)
- [ ] Crear seed con tenant demo + categorías + productos de prueba
- [ ] `.gitignore` y `.env.example`
- [ ] `git init` + crear repo `ngnzalez/ecommerce-saas` en GitHub + push inicial

### Multi-Tenant Middleware

- [ ] `middleware.ts`: leer subdominio del host → buscar tenant en DB
- [ ] Inyectar CSS variables (`--color-primary`, `--color-secondary`) en `<html>`
- [ ] Pasar tenant al layout via headers o cookies
- [ ] Redirigir a 404 si tenant no existe o está suspendido

### Home — Template Grid (default)

- [ ] `HeroBannerCarousel.tsx`: carousel de banners tipo hero con Framer Motion
- [ ] `MarqueeTicker.tsx`: ticker de textos en loop infinito animado
- [ ] Sección categorías destacadas con imágenes
- [ ] Sección productos destacados (`featured=true`)
- [ ] Sección Ofertas (productos con `comparePrice`)
- [ ] `InfoBanner.tsx`: franja informativa configurada por tenant

### Catálogo `/productos`

- [ ] Grid responsivo de ProductCard
- [ ] `ProductCard.tsx`:
  - Badge esquina sup. izq (color y texto configurables)
  - Precio tachado (`comparePrice`) + precio actual
  - % descuento calculado automáticamente si hay `comparePrice`
  - Carousel de imágenes con dots
  - Mostrar stock si `showStock=true`
  - Botón favorito (corazón, placeholder en Fase 1)
  - Botón "Agregar al carrito"
- [ ] `ProductSearch.tsx`: barra de búsqueda con debounce 300ms → API `/api/products/search`
- [ ] `CategoryFilter.tsx`: chips o sidebar de categorías → filtra el grid
- [ ] API route `GET /api/products/search?q=...&category=...&tenantId=...`

### Detalle Producto `/productos/[slug]`

- [ ] Galería de imágenes con carousel principal + thumbnails
- [ ] Badge configurable
- [ ] Precio actual + precio tachado + badge % descuento
- [ ] Stock visible si `showStock=true` → "¡Últimas unidades!" si stock ≤ 5
- [ ] Botón "Agregar al carrito" (actualiza Zustand store)
- [ ] Botón "Favorito" placeholder

### Carrito

- [ ] Store Zustand: items, cantidad, subtotal, cupón aplicado
- [ ] `CartDrawer.tsx`: slide-in desde derecha al agregar producto (Framer Motion)
- [ ] Toast notification al agregar
- [ ] Página `/carrito`:
  - Tabla: imagen + nombre + precio unitario | cantidad (+/−) | total | eliminar
  - Textarea "Instrucciones especiales del pedido"
  - `CouponInput.tsx`: campo + botón "Aplicar" → POST `/api/coupons/validate`
  - Resumen: subtotal / descuento / total estimado
  - Botón "Pagar pedido" → `/checkout`

### Checkout `/checkout`

Layout dos columnas (referencia JRPack):

**Columna izquierda:**
- Sección Contacto: email o teléfono
- Sección Entrega: nombre, apellido, empresa (opcional), dirección, RUC/CI, ciudad, teléfono
- Checkbox "Guardar mi información para la próxima vez"
- `ShippingMethodList.tsx`: radio buttons con todos los `ShippingMethod` activos del tenant (nombre + descripción + precio)
  - Al seleccionar → total del resumen actualiza en tiempo real
- `PaymentMethodList.tsx`: radio buttons de métodos activos
  - Al seleccionar → muestra detalles (datos bancarios, instrucciones)
- Dirección de facturación: checkbox "misma dirección" o "usar distinta" → despliega formulario

**Columna derecha (sticky):**
- Lista ítems: imagen thumb + nombre + qty + precio
- `CouponInput.tsx` (también aquí)
- Subtotal / Descuento / Envío / **Total**
- Botón "Finalizar el pedido"

**Lógica:**
- `POST /api/orders`: validar stock → aplicar cupón → guardar Order + OrderItems en DB → trigger emails
- Redirect a `/pedido/[orderNumber]`

### Confirmación `/pedido/[orderNumber]`

- [ ] Resumen completo del pedido
- [ ] Instrucciones específicas del método de pago elegido
- [ ] Datos del método de envío

### Emails (Resend + React Email)

- [ ] Template email cliente: número pedido, ítems, totales, instrucciones pago, link al pedido
- [ ] Template email comercio: datos cliente, ítems, método envío, método pago

### Animaciones (Framer Motion)

- [ ] Fade-in de secciones home al hacer scroll
- [ ] Hover product cards (scale leve + sombra)
- [ ] Carousel hero con transición suave
- [ ] Drawer carrito slide-in
- [ ] Toast al agregar al carrito

### Componentes Globales

- [ ] Navbar: logo del tenant, nav, búsqueda, carrito (badge con cantidad)
- [ ] Footer: redes sociales activas del tenant, info del comercio
- [ ] `WhatsAppFloat.tsx`: botón flotante WA si `tenant.whatsappFloatingButton=true`
- [ ] `SocialLinks.tsx`: iconos de redes habilitadas

---

## FASE 2 — Auth Cliente + Favoritos + Perfil

> Objetivo: clientes pueden registrarse, el comercio puede obligar registro, favoritos persisten.

- [ ] Configurar Supabase Auth (cliente separado del admin)
- [ ] Página `/login` y `/registro`
- [ ] Middleware: si `tenant.requireRegistration=true` y guest intenta checkout → redirect a `/login`
- [ ] Guest checkout funcional (sin cuenta) cuando está habilitado
- [ ] `FavoriteButton.tsx` funcional:
  - Guest: guarda en localStorage
  - Logueado: POST/DELETE `/api/favorites`
- [ ] API `/api/favorites` (GET, POST, DELETE)
- [ ] Página `/favoritos`: grid de productos guardados
- [ ] Sincronizar localStorage → DB al hacer login
- [ ] Página `/mi-cuenta`: ver y editar nombre, email, teléfono, dirección
- [ ] Página `/mi-cuenta/pedidos`: historial paginado
- [ ] Página `/mi-cuenta/pedidos/[orderNumber]`: detalle con estado actual

---

## FASE 3 — Panel Admin

> Objetivo: el comercio puede gestionar todo sin tocar código.

### Auth Admin

- [ ] Auth admin por tenant (Supabase Auth, rol separado)
- [ ] Layout admin con sidebar colapsable
- [ ] Middleware: proteger rutas `/admin/*`

### Dashboard

- [ ] Stats: pedidos del día, del mes, revenue total
- [ ] Lista últimos 5 pedidos
- [ ] Gráfico simple de ventas (últimos 7 días)

### Productos

- [ ] Lista de productos con búsqueda y filtro por categoría
- [ ] Formulario crear/editar producto:
  - Upload múltiples imágenes (drag & drop → Supabase Storage)
  - Precio + comparePrice (precio tachado)
  - Toggle showStock + campo stock
  - Toggle featured
  - Seleccionar categoría
  - `BadgeEditor.tsx`: tipo (discount/custom), texto libre, color picker (rojo/verde/azul/naranja/negro)
- [ ] Eliminar producto (soft delete)

### Categorías

- [ ] CRUD categorías con imagen upload
- [ ] Ordenar drag & drop

### Pedidos

- [ ] Lista con filtros: estado, fecha, búsqueda por número/cliente
- [ ] Detalle pedido: ítems, datos cliente, envío, pago, notas
- [ ] Cambiar estado con selector
- [ ] Badge de color por estado

### Cupones

- [ ] Lista de cupones activos e inactivos
- [ ] Formulario: código, tipo (% o monto fijo), valor, monto mínimo, fecha expiración, usos máximos
- [ ] Ver usos actuales vs máximos
- [ ] Activar/desactivar

### Métodos de Envío

- [ ] Lista de métodos (reordenable drag & drop)
- [ ] Formulario: nombre, descripción, tipo (pickup/delivery), precio (0 = gratis)
- [ ] Activar/desactivar

### Métodos de Pago

- [ ] Toggle por tipo: Transferencia, Pagopar, WhatsApp, Efectivo, Tigo
- [ ] Al activar → textarea para ingresar datos/instrucciones
- [ ] Orden configurable

### Banners

- [ ] Tabs por tipo: Hero / Info / Ofertas
- [ ] Upload imagen, título, subtítulo, URL de enlace
- [ ] Reordenar drag & drop
- [ ] Activar/desactivar

### Marquee

- [ ] Lista de textos del ticker
- [ ] Agregar/editar/eliminar
- [ ] Reordenar

### Panel de Diseño

- [ ] Color picker para color primario y secundario
- [ ] Upload logo (muestra preview)
- [ ] Upload favicon
- [ ] Selector home template: 4 opciones con preview visual

### Redes Sociales

- [ ] Toggle por red: Facebook, Instagram, TikTok, X, YouTube, WhatsApp
- [ ] Al activar → campo URL
- [ ] Reordenar
- [ ] Toggle botón flotante WhatsApp

### Config Tienda

- [ ] Nombre del comercio
- [ ] Dirección
- [ ] Número WhatsApp
- [ ] Email de notificaciones
- [ ] Toggle "Obligar registro para comprar"

---

## FASE 4 — Templates, Pagopar, Polish, Deploy

> Objetivo: producto terminado y deployado en producción.

### Templates de Home

- [ ] `HomeHero.tsx`: gran hero fullscreen + CTA + grid debajo
- [ ] `HomeMinimal.tsx`: tipografía grande, pocas categorías, limpio
- [ ] `HomeMagazine.tsx`: layout editorial con secciones marcadas
- [ ] `SplitSection.tsx`: imagen izq + texto/CTA derecha (configurable en admin)
- [ ] `EditorialGrid.tsx`: texto izq + mosaico fotos derecha

### Pagopar

- [ ] Integrar Pagopar SDK/API
- [ ] Flujo de pago: crear order en Pagopar → redirect → callback → actualizar paymentStatus en DB
- [ ] Email al confirmar pago exitoso

### Super-Admin (`admin.tuapp.com`)

- [ ] Auth super-admin
- [ ] Lista de todos los tenants con estado
- [ ] Crear nuevo tenant (genera slug, crea admin user)
- [ ] Editar tenant
- [ ] Suspender/activar tenant

### SEO y Performance

- [ ] Metadata dinámica por tenant: title, description, OG image con logo del comercio
- [ ] `sitemap.xml` dinámico por tenant
- [ ] Optimización imágenes con `next/image` + Supabase CDN
- [ ] Lazy loading de secciones del home

### Deploy

- [ ] Configurar Vercel: wildcard domain `*.tuapp.com`
- [ ] Variables de entorno en Vercel
- [ ] DNS: registro wildcard en proveedor del dominio
- [ ] Test completo en producción: checkout → emails → admin
- [ ] Monitoreo de errores

---

## Convenciones Git

- Branch por fase: `fase-1`, `fase-2`, `fase-3`, `fase-4`
- Commits en español, convencional: `feat:`, `fix:`, `chore:`
- PR de cada fase hacia `main` al terminar
- Repo: `github.com/ngnzalez/ecommerce-saas`
