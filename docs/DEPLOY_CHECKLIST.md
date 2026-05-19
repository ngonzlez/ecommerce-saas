# Deploy Checklist — Ecommerce SaaS

## Estado actual de ramas

| Rama | Propósito | Estado |
|------|-----------|--------|
| `main` | Producción | ✅ Fases 1–4 completas |
| `dev` | Desarrollo / staging | ✅ Creada desde main |
| `fase-1..4` | Historial | Mergeadas, pueden borrarse |

---

## 1. Supabase — Proyecto PRODUCCIÓN

> Ya existente. Verificar que tenga todo configurado.

- [ ] Proyecto activo en [supabase.com](https://supabase.com)
- [ ] `npx prisma migrate deploy` ejecutado contra DB de producción
- [ ] Auth habilitado (Email/Password)
- [ ] Storage bucket `uploads` creado con política pública para lectura
- [ ] RLS en Storage: solo admin puede escribir en `/tenantId/*`
- [ ] Usuario super-admin creado en Supabase Auth (email que va en `SUPER_ADMIN_EMAIL`)
- [ ] SMTP configurado en Supabase (para emails de auth)

**Variables a copiar para Vercel:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
```

---

## 2. Supabase — Proyecto DEV (nuevo)

> Crear proyecto separado para no tocar datos de producción.

- [ ] Crear nuevo proyecto en Supabase → nombre: `ecommerce-saas-dev`
- [ ] Anotar URL y keys del proyecto dev
- [ ] Ejecutar `npx prisma migrate deploy` contra la DB dev
- [ ] Crear usuario de prueba en Supabase Auth del proyecto dev
- [ ] Crear Storage bucket `uploads` en proyecto dev
- [ ] Ejecutar seed: `npx prisma db seed` para tenant demo

**Variables para `.env.local` local / Vercel preview:**
```
NEXT_PUBLIC_SUPABASE_URL=https://yyyy.supabase.co   # URL del proyecto DEV
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...               # Anon key DEV
SUPABASE_SERVICE_ROLE_KEY=eyJh...                    # Service role key DEV
```

---

## 3. Variables de entorno — Referencia completa

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Supabase connection string)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# App
NEXT_PUBLIC_APP_DOMAIN=tuapp.com         # dominio base del SaaS
NEXT_PUBLIC_APP_URL=https://tuapp.com    # URL base para redirects
TENANT_SLUG_DEV=demo                     # slug usado en localhost

# Super-admin
SUPER_ADMIN_EMAIL=superadmin@tuapp.com   # único email con acceso al panel global

# Resend (emails transaccionales)
RESEND_API_KEY=re_...
RESEND_FROM=noreply@tuapp.com

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 4. Vercel — Proyecto PRODUCCIÓN

- [ ] Importar repo `ngonzlez/ecommerce-saas` en Vercel
- [ ] Framework: Next.js (detectado automático)
- [ ] Branch de deploy: **`main`**
- [ ] Agregar todas las variables de entorno de producción (sección 3)
- [ ] Dominio principal: `tuapp.com` → apunta a Vercel
- [ ] Wildcard domain: `*.tuapp.com` → mismo deployment en Vercel
  - En Vercel: Settings → Domains → Add → `*.tuapp.com`
- [ ] Dominio super-admin: `admin.tuapp.com` → mismo deployment
  - Se maneja automáticamente por el wildcard + middleware

---

## 5. Vercel — Entorno DEV / Preview

- [ ] En el mismo proyecto Vercel, ir a Settings → Git
- [ ] "Preview Branches": agregar rama `dev`
- [ ] Agregar variables de entorno para el entorno **Preview**:
  - Mismas keys que producción pero con valores del proyecto Supabase DEV
  - `NEXT_PUBLIC_APP_DOMAIN=preview.tuapp.com` (o dejar igual si se prueba local)
  - `TENANT_SLUG_DEV=demo`
- [ ] Cada PR a `main` generará un preview URL automático de Vercel

**Flujo de trabajo:**
```
feature/* → dev → (PR) → main → deploy producción
                  ↓
            preview URL de Vercel (usa Supabase DEV)
```

---

## 6. DNS — Configuración wildcard

En el panel de tu registrador de dominio (Namecheap, Cloudflare, etc.):

```
Tipo    Nombre    Valor                   TTL
A       @         76.76.21.21             Auto   ← IP de Vercel
CNAME   www       cname.vercel-dns.com    Auto
CNAME   *         cname.vercel-dns.com    Auto   ← wildcard para subtiendas
CNAME   admin     cname.vercel-dns.com    Auto   ← super-admin (o cae en wildcard)
```

> Si usás Cloudflare: desactivar proxy (nube naranja → gris) en el registro wildcard, Vercel necesita SSL propio.

---

## 7. Deploy — Pasos en orden

```bash
# 1. Verificar que main está limpio
git checkout main && git status

# 2. Correr migrations en DB de producción
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# 3. Push a main (dispara deploy en Vercel automático)
git push origin main

# 4. Verificar build en Vercel dashboard
# 5. Test checkout completo en producción
# 6. Test email cliente + comercio con pedido real
# 7. Test admin: login, crear producto, cambiar estado pedido
# 8. Test super-admin: login, crear tenant, suspender
```

---

## 8. Test completo post-deploy

### Storefront
- [ ] Home carga con template configurado
- [ ] Búsqueda de productos funciona
- [ ] Agregar producto al carrito
- [ ] Aplicar cupón válido
- [ ] Checkout completo → email cliente + email comercio
- [ ] Página `/pedido/[número]` muestra instrucciones correctas

### Admin (tienda)
- [ ] Login admin → dashboard con stats
- [ ] Crear producto con imágenes
- [ ] Cambiar estado de pedido
- [ ] Configurar método de pago → instrucciones visibles en checkout
- [ ] Cambiar template de home → verificar cambio en tienda

### Super-Admin
- [ ] Login en `admin.tuapp.com`
- [ ] Crear tenant nuevo → acceder en `slug.tuapp.com`
- [ ] Suspender tenant → verificar 404 en storefront

### SEO
- [ ] `tuapp.com/sitemap.xml` retorna URLs correctas
- [ ] `<title>` de producto = nombre del producto
- [ ] og:image = imagen del producto o logo del tenant

---

## 9. Monitoreo de errores

- [ ] Agregar [Sentry](https://sentry.io) (free tier suficiente):
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```
  Variables: `SENTRY_DSN=https://...`

- [ ] O usar **Vercel Analytics** (integrado, 0 config):
  - Dashboard Vercel → Analytics → Enable

---

## 10. Rama dev — Setup local

```bash
git checkout dev

# Copiar .env.example a .env.local con variables del proyecto Supabase DEV
cp .env.example .env.local
# Editar .env.local con los valores del proyecto dev

# Correr migrations en DB dev
npx prisma migrate deploy

# Seed con datos de prueba
npx prisma db seed

# Iniciar dev server
npm run dev
```

> Futuros features: crear rama `feature/nombre` desde `dev`, PR a `dev`, luego PR `dev → main`.
