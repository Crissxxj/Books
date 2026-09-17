# Papel & Tinta — Librería online

Tienda de libros con catálogo (fantasía, dark romance, romance vainilla y sport romance), favoritos, carrito,
cuentas de usuario (correo/contraseña y Google), pagos reales con **Payphone** (Ecuador), y un panel de
administrador para gestionar el catálogo.

## Stack usado

- **Next.js 14** (App Router) + **TypeScript** — frontend y backend en un solo proyecto
- **Tailwind CSS** — estilos
- **PostgreSQL** + **Prisma ORM** — base de datos
- **NextAuth.js** — autenticación (Google OAuth + correo/contraseña)
- **Payphone (Botón de Pago)** — pagos reales con tarjeta, pensado para comercios en Ecuador

---

## 1. Requisitos previos (instalar en tu computadora)

1. **Node.js 18.18 o superior** → https://nodejs.org (descarga la versión LTS)
   - Verifica con: `node -v`
2. **Git** (opcional pero recomendado) → https://git-scm.com
3. **PostgreSQL** — dos opciones:
   - **Opción fácil (recomendada):** una base de datos gratuita en la nube, sin instalar nada local:
     - [Neon](https://neon.tech) o [Supabase](https://supabase.com) (ambos tienen plan gratuito). Al crear el
       proyecto te dan una cadena de conexión `postgresql://...` que va directo en `DATABASE_URL`.
     - Si despliegas en Render, también puedes crear ahí mismo una base de datos PostgreSQL administrada
       (ver sección 8).
   - **Opción local:** instalar PostgreSQL en tu máquina → https://www.postgresql.org/download/
4. **Visual Studio Code** → https://code.visualstudio.com
   - Extensiones recomendadas: "Prisma" y "Tailwind CSS IntelliSense"
5. Una cuenta en **Google Cloud** (gratis) para el login con Google → https://console.cloud.google.com
6. Una cuenta en **Payphone Business** (gratis, se registra con cédula o RUC) → https://business.payphone.app

---

## 2. Instalación del proyecto

Abre esta carpeta en VS Code y en la terminal integrada ejecuta:

```bash
npm install
```

Esto instala Next.js, Prisma, NextAuth y todo lo demás.

---

## 3. Configurar las variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Y completa cada valor en `.env` (abajo se explica cómo obtener cada uno).

### 3.1 Base de datos (`DATABASE_URL`)

Pega la cadena de conexión de Neon/Supabase/Render, o si usas PostgreSQL local algo como:

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

### 3.4 Pagos con Payphone (`PAYPHONE_TOKEN`, `PAYPHONE_STOREID`)

Stripe no opera con comercios domiciliados en Ecuador, así que este proyecto usa **Payphone**, una pasarela
ecuatoriana que sí permite abrir cuenta con cédula (no necesitas RUC ni empresa constituida para el ambiente
de pruebas).

1. Regístrate en https://business.payphone.app
2. Dentro de tu cuenta, crea un usuario con el rol **"Desarrollador"**
3. Entra a **Payphone Developer** y crea una nueva aplicación de tipo **"WEB"**
   - **Dominio web:** para desarrollo local puedes usar `http://localhost:3000` (Payphone lo permite sin SSL
     solo para pruebas). Para producción, usa el dominio real de tu sitio en Render.
   - **URL de respuesta:** `http://localhost:3000/checkout/success` (o tu dominio de producción)
4. Copia el **Token** (Bearer Token) → `PAYPHONE_TOKEN`
5. Copia el **StoreId** → `PAYPHONE_STOREID`
6. Mientras estés en el **ambiente de pruebas**, todas las transacciones se aprueban automáticamente: no se
   conecta con bancos reales y puedes usar cualquier dato de tarjeta ficticio válido. No necesitas nada como
   la CLI de Stripe ni un webhook aparte: Payphone confirma el pago cuando el cliente vuelve a
   `/checkout/success`.
7. Cuando quieras cobrar de verdad, cambia a **producción** desde Payphone Business (ver su guía "Pruebas y
   paso a producción") y actualiza el dominio autorizado de tu aplicación al de Render.

> Si en el futuro quieres una segunda opción de pago en Ecuador, las alternativas equivalentes son
> **Datafast** y **Kushki**; ambas requieren RUC y proceso de aprobación más largo, por eso Payphone es la
> mejor opción para empezar.

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

> **Nota sobre el cambio de esquema:** el modelo `Pedido` ahora usa el campo `pagoExternoId` en vez de
> `stripeSessionId`. Si ya tenías datos cargados con el esquema anterior, `npm run db:push` te pedirá
> confirmar el cambio de columna (los pedidos de prueba antiguos perderán ese dato puntual, nada más).

---

## 5. Agregar portadas reales a los libros

El catálogo de ejemplo trae portadas *placeholder* (un color por género con el título superpuesto). Para
poner portadas reales sin tener que buscarlas una por una, hay un script que las busca automáticamente en
**Open Library** (base de datos pública y gratuita de portadas de libros, usada por miles de sitios y apps
de lectura):

```bash
npm run covers:fetch
```

Esto recorre todos los libros de tu base de datos, busca la portada por título + autor y actualiza
`portadaUrl`. Los libros que no encuentre quedan con el placeholder anterior — puedes completarlos a mano
desde `/admin/libros` pegando cualquier URL de imagen en el campo "URL de portada".

Si quieres usar imágenes de otro proveedor (Google Books, tu propio storage en Cloudinary/S3, etc.),
recuerda agregar ese dominio a `images.remotePatterns` en `next.config.js`, o Next.js rechazará la imagen.

---

## 6. Correr el proyecto en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

- Catálogo y filtros por género: página principal
- Crear cuenta / entrar con Google o correo: `/registro` y `/login`
- Favoritos: `/favoritos`
- Carrito y pago con Payphone: `/carrito`
- Panel de administrador (requiere el usuario Admin): `/admin`

Al pagar en el ambiente de pruebas de Payphone, todas las transacciones se aprueban automáticamente —no
necesitas dejar ningún proceso extra corriendo en otra terminal, a diferencia del webhook de Stripe.

---

## 7. Panel de administrador

Inicia sesión con `admin@papelytinta.com` / `Admin123!` (o convierte tu propio usuario en admin cambiando su
`role` a `ADMIN` desde `npm run db:studio`). Desde `/admin` puedes:

- Ver estadísticas generales (libros, usuarios, pedidos, ingresos)
- Ir a `/admin/libros` para ver el catálogo completo
- Agregar libros nuevos (`/admin/libros/nuevo`) con título, autor, descripción, precio, stock, género y portada
- Editar o eliminar libros existentes

---

## 8. Publicar el sitio en Render

1. Sube el proyecto a un repositorio de GitHub (ya lo tienes en `github.com/Crissxxj/Books`)
2. En https://dashboard.render.com, crea primero la base de datos:
   - **New +** → **PostgreSQL** → elige un nombre y la región más cercana → plan Free
   - Cuando esté lista, copia su **"Internal Database URL"**
3. Crea el servicio web:
   - **New +** → **Web Service** → conecta tu repo `Books`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. En la pestaña **Environment** del Web Service, agrega todas las variables de tu `.env`:
   - `DATABASE_URL` → la Internal Database URL del paso 2
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → la URL pública que te da Render (ej. `https://papel-y-tinta.onrender.com`)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `PAYPHONE_TOKEN`, `PAYPHONE_STOREID`
   - `NEXT_PUBLIC_SITE_URL` → la misma URL pública de Render
5. Actualiza las URLs autorizadas:
   - En Google Cloud: agrega `https://tu-app.onrender.com` a los orígenes y
     `https://tu-app.onrender.com/api/auth/callback/google` a las redirecciones
   - En Payphone Developer: cambia el dominio autorizado de tu aplicación "WEB" al dominio de Render
6. Antes del primer deploy (o desde la shell de Render una vez desplegado), corre las migraciones y el seed:
   ```bash
   npx prisma db push
   npm run db:seed        # opcional, solo si quieres el catálogo de ejemplo
   npm run covers:fetch   # opcional, para las portadas reales
   ```
   Render permite abrir una "Shell" del servicio ya desplegado para correr estos comandos una sola vez.
7. Cuando quieras cobrar de verdad, pasa tu cuenta de Payphone a modo producción (ver sección 3.4).

> El plan Free de Render "duerme" el servicio tras un rato sin tráfico y tarda unos segundos en despertar en
> la siguiente visita — normal para un proyecto de estudio, pero tenlo en cuenta si haces una demostración en
> vivo.

---

## 9. Estructura del proyecto

```
src/
  app/
    page.tsx                 → catálogo / inicio
    libro/[id]/               → detalle de libro
    favoritos/                → favoritos del usuario
    carrito/                  → carrito + botón de pago
    checkout/success/         → recibe la redirección de Payphone y confirma el pago
    login/  registro/         → autenticación
    admin/                     → panel de administrador (protegido)
    api/
      auth/[...nextauth]/      → NextAuth (Google + credenciales)
      auth/registro/           → registro de usuarios con correo/contraseña
      libros/                  → API pública/admin del catálogo
      favoritos/               → API de favoritos
      carrito/                 → API del carrito
      checkout/                → prepara la transacción en Payphone
  components/                 → Navbar, BookCard, botones de carrito/favoritos, etc.
  lib/                        → clientes de Prisma, NextAuth y Payphone
scripts/
  fetch-covers.ts              → busca portadas reales en Open Library y las guarda en la BD
prisma/
  schema.prisma                → modelos de la base de datos
  seed.ts                       → catálogo inicial de libros + usuarios de ejemplo
```

---

## 10. Notas importantes

- Los libros del catálogo son obras reales conocidas (título/autor/género), pero las **descripciones son
  redactadas originalmente para este proyecto**, no copiadas de contraportadas. Puedes editarlas libremente
  desde el panel de administrador.
- Las portadas se obtienen de Open Library, una base de datos pública pensada justamente para identificar
  libros por su cubierta (el mismo tipo de uso que hacen catálogos de librerías reales); si más adelante
  cambias a portadas propias o de otro proveedor, actualiza `images.remotePatterns` en `next.config.js`.
- Este proyecto es una base sólida y funcional, pero antes de manejar pagos reales de producción revisa la
  configuración de seguridad de tu cuenta de Payphone, agrega páginas de política de privacidad/devoluciones,
  y considera agregar límites de tasa (rate limiting) a las rutas de API públicas.
- **Nunca subas tu archivo `.env` a GitHub.** Ya está en `.gitignore` y, al revisar el repositorio, no
  aparece en el historial de commits — así debe seguir. Si alguna vez compartes este proyecto (zip, otro
  computador, etc.), verifica que el `.env` con tus claves reales no vaya incluido.
