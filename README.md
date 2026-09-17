# Papel & Tinta — Librería online

Tienda de libros con catálogo (fantasía, dark romance, romance vainilla y sport romance), favoritos, carrito,
cuentas de usuario (correo/contraseña y Google), pagos reales con Stripe, y un panel de administrador para
gestionar el catálogo.

## Stack usado

- **Next.js 14** (App Router) + **TypeScript** — frontend y backend en un solo proyecto
- **Tailwind CSS** — estilos
- **PostgreSQL** + **Prisma ORM** — base de datos
- **NextAuth.js** — autenticación (Google OAuth + correo/contraseña)
- **Stripe Checkout** — pagos reales (tarjeta)

---

## 1. Requisitos previos (instalar en tu computadora)

1. **Node.js 18.18 o superior** → https://nodejs.org (descarga la versión LTS)
   - Verifica con: `node -v`
2. **Git** (opcional pero recomendado) → https://git-scm.com
3. **PostgreSQL** — dos opciones:
   - **Opción fácil (recomendada):** una base de datos gratuita en la nube, sin instalar nada local:
     - [Neon](https://neon.tech) o [Supabase](https://supabase.com) (ambos tienen plan gratuito). Al crear el
       proyecto te dan una cadena de conexión `postgresql://...` que va directo en `DATABASE_URL`.
   - **Opción local:** instalar PostgreSQL en tu máquina → https://www.postgresql.org/download/
4. **Visual Studio Code** → https://code.visualstudio.com
   - Extensiones recomendadas: "Prisma" y "Tailwind CSS IntelliSense"
5. Una cuenta en **Stripe** (gratis) → https://dashboard.stripe.com/register
6. Una cuenta en **Google Cloud** (gratis) para el login con Google → https://console.cloud.google.com

---

## 2. Instalación del proyecto

Abre esta carpeta en VS Code y en la terminal integrada ejecuta:

```bash
npm install
```

Esto instala Next.js, Prisma, NextAuth, Stripe y todo lo demás.

---

## 3. Configurar las variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Y completa cada valor en `.env` (abajo se explica cómo obtener cada uno).

### 3.1 Base de datos (`DATABASE_URL`)

Pega la cadena de conexión de Neon/Supabase, o si usas PostgreSQL local algo como:

```
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/libreria?schema=public"
```

### 3.2 NextAuth (`NEXTAUTH_SECRET`)

Genera un valor aleatorio seguro. En la terminal:

```bash
# Mac/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))
```

Pega el resultado en `NEXTAUTH_SECRET`. Deja `NEXTAUTH_URL="http://localhost:3000"` para desarrollo local.

### 3.3 Login con Google (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`)

1. Ve a https://console.cloud.google.com/apis/credentials
2. Crea un proyecto nuevo (o usa uno existente)
3. Click en **"Crear credenciales" → "ID de cliente de OAuth"**
4. Tipo de aplicación: **Aplicación web**
5. En **"Orígenes de JavaScript autorizados"** agrega:
   `http://localhost:3000`
6. En **"URI de redirección autorizados"** agrega:
   `http://localhost:3000/api/auth/callback/google`
7. Copia el **Client ID** y **Client Secret** generados a tu `.env`

### 3.4 Pagos con Stripe (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`)

1. Entra a https://dashboard.stripe.com/test/apikeys (modo de **prueba**, no cobra dinero real todavía)
2. Copia la **Clave secreta** (`sk_test_...`) → `STRIPE_SECRET_KEY`
3. Copia la **Clave publicable** (`pk_test_...`) → `STRIPE_PUBLISHABLE_KEY`
4. Para el webhook (necesario para confirmar pagos automáticamente):
   - Instala Stripe CLI: https://docs.stripe.com/stripe-cli
   - Ejecuta:
     ```bash
     stripe login
     stripe listen --forward-to localhost:3000/api/webhooks/stripe
     ```
   - Este comando imprime un `whsec_...`. Cópialo en `STRIPE_WEBHOOK_SECRET`.
   - Deja esta terminal corriendo mientras pruebas pagos localmente.
5. Cuando quieras aceptar pagos reales, cambia tu cuenta de Stripe a modo **Live**, repite estos pasos con
   las claves `sk_live_...` / `pk_live_...`, y configura el webhook de producción desde el Dashboard de
   Stripe (Developers → Webhooks) apuntando a `https://tu-dominio.com/api/webhooks/stripe`.

**Tarjeta de prueba de Stripe** (para probar el checkout sin gastar dinero real):
`4242 4242 4242 4242`, cualquier fecha futura, cualquier CVC.

---

## 4. Crear las tablas y cargar el catálogo de libros

Con `DATABASE_URL` ya configurado:

```bash
npm run db:push     # crea las tablas en tu base de datos según prisma/schema.prisma
npm run db:seed     # carga ~40 libros (fantasía, dark romance, romance vainilla, sport romance)
                     # y crea un usuario administrador y uno de prueba
```

Credenciales creadas por el seed:

| Rol   | Correo                    | Contraseña   |
|-------|----------------------------|--------------|
| Admin | admin@papelytinta.com      | Admin123!    |
| Usuario | lectora@ejemplo.com       | Lectora123! |

Puedes explorar visualmente la base de datos con:

```bash
npm run db:studio
```

---

## 5. Correr el proyecto en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

- Catálogo y filtros por género: página principal
- Crear cuenta / entrar con Google o correo: `/registro` y `/login`
- Favoritos: `/favoritos`
- Carrito y pago con Stripe: `/carrito`
- Panel de administrador (requiere el usuario Admin): `/admin`

Recuerda tener corriendo `stripe listen --forward-to localhost:3000/api/webhooks/stripe` en otra terminal
para que los pagos se confirmen automáticamente.

---

## 6. Panel de administrador

Inicia sesión con `admin@papelytinta.com` / `Admin123!` (o convierte tu propio usuario en admin cambiando su
`role` a `ADMIN` desde `npm run db:studio`). Desde `/admin` puedes:

- Ver estadísticas generales (libros, usuarios, pedidos, ingresos)
- Ir a `/admin/libros` para ver el catálogo completo
- Agregar libros nuevos (`/admin/libros/nuevo`) con título, autor, descripción, precio, stock, género y portada
- Editar o eliminar libros existentes

Las portadas del catálogo de ejemplo usan imágenes generadas automáticamente (placeholder). Para producción,
sube tus propias portadas a un servicio como Cloudinary, S3 o Vercel Blob y pega esa URL en el campo
"URL de portada".

---

## 7. Estructura del proyecto

```
src/
  app/
    page.tsx                 → catálogo / inicio
    libro/[id]/               → detalle de libro
    favoritos/                → favoritos del usuario
    carrito/                  → carrito + botón de pago
    checkout/success/         → confirmación tras pagar
    login/  registro/         → autenticación
    admin/                     → panel de administrador (protegido)
    api/
      auth/[...nextauth]/      → NextAuth (Google + credenciales)
      auth/registro/           → registro de usuarios con correo/contraseña
      libros/                  → API pública/admin del catálogo
      favoritos/               → API de favoritos
      carrito/                 → API del carrito
      checkout/                → crea la sesión de pago en Stripe
      webhooks/stripe/         → confirma el pago y actualiza el pedido
  components/                 → Navbar, BookCard, botones de carrito/favoritos, etc.
  lib/                        → clientes de Prisma, NextAuth y Stripe
prisma/
  schema.prisma                → modelos de la base de datos
  seed.ts                       → catálogo inicial de libros + usuarios de ejemplo
```

---

## 8. Publicar el sitio (opcional)

La forma más simple es **Vercel** (creadores de Next.js, tienen plan gratuito):

1. Sube el proyecto a un repositorio de GitHub
2. Importa el repositorio en https://vercel.com/new
3. Agrega todas las variables de `.env` en la configuración del proyecto en Vercel
4. Cambia `NEXTAUTH_URL` y `NEXT_PUBLIC_SITE_URL` a tu dominio real (`https://tu-sitio.vercel.app`)
5. Actualiza las URLs autorizadas en Google Cloud y el webhook de Stripe para que apunten a ese dominio
6. Usa una base de datos PostgreSQL en la nube (Neon/Supabase funcionan perfecto con Vercel)

---

## 9. Notas importantes

- Los libros del catálogo son obras reales conocidas (título/autor/género), pero las **descripciones son
  redactadas originalmente para este proyecto**, no copiadas de contraportadas. Puedes editarlas libremente
  desde el panel de administrador.
- Las portadas de ejemplo son *placeholders* generados automáticamente; para un sitio real deberías subir
  portadas propias o con licencia adecuada.
- Este proyecto es una base sólida y funcional, pero antes de manejar pagos reales de producción revisa la
  configuración de seguridad de Stripe, agrega páginas de política de privacidad/devoluciones, y considera
  agregar límites de tasa (rate limiting) a las rutas de API públicas.
"# Books" 
"# TIENDA-LIBROS" 
