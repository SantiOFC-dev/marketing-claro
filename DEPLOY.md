# Deploy en Railway

## 1. Subir el repo

Sube este proyecto a GitHub.

## 2. Crear proyecto en Railway

1. Entra a `Railway`
2. Click en `New Project`
3. Elige `Deploy from GitHub repo`
4. Selecciona este repositorio

## 3. Agregar Postgres

1. Dentro del proyecto, agrega un servicio `PostgreSQL`
2. Railway generara automaticamente la variable de conexion

## 4. Variables de entorno del servicio web

Configura estas variables en el servicio de la app:

```env
LIVEBLOCKS_SECRET_KEY=tu_liveblocks_secret
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=tu_liveblocks_public_key
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

## 5. Build y arranque

Este repo ya incluye `railway.json`, asi que Railway deberia usar:

- build: `npm ci && npm run prisma:generate && npm run build`
- start: `npm run prisma:push && npm run start`

## 6. Verificar deploy

Cuando termine el deploy, revisa:

- que la home cargue
- que el dashboard renderice
- que Liveblocks conecte
- que comentarios y layout persistan

## 7. Conectar subdominio

Ejemplo: `dashboard.tudominio.com`

1. Ve a `Railway -> Settings -> Domains`
2. Agrega el subdominio custom
3. Railway te mostrara el target DNS
4. En tu proveedor DNS crea el registro indicado, normalmente:

```text
Type: CNAME
Name: dashboard
Target: <host-entregado-por-railway>
```

5. Espera propagacion
6. Railway emitira SSL automaticamente

## 8. Troubleshooting rapido

- Si falla Prisma: revisa `DATABASE_URL`
- Si falla Liveblocks: revisa `LIVEBLOCKS_SECRET_KEY`
- Si no carga el frontend: revisa logs del build en Railway
- Si el subdominio no responde: revisa propagacion DNS y el `CNAME`

## 9. Antes de publicar

Puedes validar localmente con:

```bash
npm run lint
npm run typecheck
npm run build
```

## 10. Revisar rendimiento con Google PageSpeed

Cuando el deploy ya este arriba, corre:

```bash
npm run audit:pagespeed -- https://dashboard.tudominio.com
```

Prioriza estas metricas:

- `LCP`
- `INP`
- `CLS`
- score mobile

Si quieres mas cuota para auditorias, agrega `PAGESPEED_API_KEY` en tu entorno local.
