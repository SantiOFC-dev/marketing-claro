# Ads Command Center

Dashboard analitico editable en `Next.js` inspirado visualmente en Facebook Ads Manager, con simulacion intradia, widgets movibles y base de colaboracion con `Liveblocks`.

## Stack

- `Next.js` App Router
- `TypeScript`
- `Tailwind CSS`
- primitives estilo `shadcn/ui`
- `TanStack Table`
- `Recharts`
- `react-grid-layout`
- `Liveblocks`
- persistencia local con `localStorage`

## Setup rapido

1. Instala dependencias:

```bash
npm install
```

2. Copia variables de entorno:

```bash
cp .env.example .env.local
```

3. Levanta Postgres local si quieres correr el mismo stack de produccion:

```bash
docker compose up -d
```

4. Agrega tus credenciales de Liveblocks en `.env.local`:

```env
LIVEBLOCKS_SECRET_KEY=sk_prod_xxx
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_prod_xxx
DATABASE_URL="postgresql://postgres:password@localhost:5432/ads_command_center?schema=public"
```

5. Sincroniza Prisma:

```bash
npm run prisma:push
```

6. Inicia el proyecto:

```bash
npm run dev
```

7. Abre `http://localhost:3000`

## Si no configuras Liveblocks

- El dashboard sigue funcionando localmente.
- La simulacion, filtros, layout editable y persistencia en `localStorage` siguen activos.
- La colaboracion en tiempo real y auth de `Liveblocks` no conectaran hasta definir `LIVEBLOCKS_SECRET_KEY`.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run prisma:push
npm run audit:pagespeed -- https://tu-url.com
```

## Auditar con Google PageSpeed

Puedes usar PageSpeed Insights directamente o correr el script local contra la URL publicada:

```bash
npm run audit:pagespeed -- https://dashboard.tudominio.com
```

Opcionalmente puedes definir `PAGESPEED_API_KEY` si quieres mayor cuota de uso.

Que conviene revisar primero:

- `LCP`
- `INP`
- `CLS`
- peso de JS por charts, tabla y widgets colaborativos
- carga en mobile sobre la URL real de Railway/subdominio

## Deploy recomendado: Railway + Postgres

1. Sube este repo a GitHub.
2. En Railway crea un proyecto nuevo desde GitHub.
3. Agrega un servicio `PostgreSQL` dentro del mismo proyecto.
4. En el servicio web configura estas variables:

```env
LIVEBLOCKS_SECRET_KEY=sk_prod_xxx
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_prod_xxx
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

5. Railway ejecutara `npm install`, `prisma generate` y el build.
6. En runtime ejecuta `npm run prisma:push && npm run start` para asegurar el esquema.

## Subdominio por DNS

Puedes publicarlo en un subdominio como:

- `ads.tudominio.com`
- `dashboard.tudominio.com`

Flujo recomendado:

1. En Railway abre `Settings -> Domains`.
2. Agrega tu subdominio custom.
3. Railway te mostrara el target DNS.
4. En tu proveedor DNS crea el registro pedido, normalmente un `CNAME`.
5. Espera propagacion y Railway emitira SSL automaticamente.

Ejemplo comun:

```text
Type: CNAME
Name: dashboard
Target: <railway-provided-host>
```

## Nota sobre base de datos

- Para deploy productivo se recomienda `Postgres`.
- `SQLite` fue util para el MVP local, pero no es la mejor opcion para despliegue serio en plataforma gestionada.
- Esta configuracion ya queda orientada a `Railway + Postgres`.

## Estructura principal

```text
src/
  app/
    api/liveblocks-auth/
  components/
    dashboard/
    ui/
  data/mock/
  hooks/
  lib/
    dashboard/
    liveblocks/
    persistence/
    simulation/
  types/
```

## Que incluye este MVP

- simulacion diaria con curva no lineal por hora
- reach, impressions, clicks, leads, spend, CTR, CPC, CPM y CPL
- comparacion vs ayer y vs 7 dias
- tabla estilo Ads Manager
- KPI cards superiores
- line charts, funnel y breakdown
- mover, redimensionar, ocultar y duplicar widgets
- comentarios por widget
- presencia en tiempo real con `Liveblocks`
- base lista para conectar Meta Ads API real despues

## Archivos utiles

- `src/lib/simulation/reports.ts`
- `src/hooks/use-dashboard-state.ts`
- `src/components/dashboard/dashboard-page.tsx`
- `src/app/api/liveblocks-auth/route.ts`

## Nota visual

La UI busca una inspiracion clara en Ads Manager, pero no una copia literal. La arquitectura esta separada para que puedas cambiar branding, cuentas y fuentes de datos sin rehacer el producto.
