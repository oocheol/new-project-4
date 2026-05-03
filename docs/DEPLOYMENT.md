# Deployment Guide

## 1. Supabase PostgreSQL

Create a Supabase project and copy the PostgreSQL connection values.

Backend environment variables:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<supabase-db-password>
ALLOWED_ORIGINS=https://<your-vercel-domain>
```

Render, Supabase, and Northflank-style `postgresql://...` or `postgres://...` URLs are converted to `jdbc:postgresql://...` automatically.

## 2. Northflank Backend

Northflank Sandbox is the recommended free backend target for the Spring Boot API. Use a combined service so Northflank builds the Docker image from GitHub and runs it as a public API service.

Create a Northflank combined service:

- Repository: `oocheol/new-project-4`
- Branch: `master`
- Service type: Combined
- Build type: Dockerfile
- Build context: `/apps/api`
- Dockerfile path: `/apps/api/Dockerfile`
- Public port: `8080`
- Health check path: `/api/health`

Environment variables:

```text
SPRING_DATASOURCE_URL=<your-postgres-url>
SPRING_DATASOURCE_USERNAME=<your-db-user-if-not-in-url>
SPRING_DATASOURCE_PASSWORD=<your-db-password-if-not-in-url>
ALLOWED_ORIGINS=https://<your-vercel-domain>
```

You can keep using the existing external Postgres database, or create a Northflank Postgres addon and copy its connection details into the variables above.

After Northflank gives you a public service URL, update the Vercel frontend variable:

```text
VITE_API_BASE_URL=https://<your-northflank-service-url>
```

Then redeploy the Vercel frontend.

## 3. Render Backend

Create a new Web Service from this repository.

- Root directory: `apps/api`
- Runtime: Docker
- Dockerfile path: `apps/api/Dockerfile`

You can also use `infra/render.yaml` as a blueprint reference.

## 4. Vercel Frontend

Create a Vercel project from this repository.

- Git repository: `oocheol/new-project-4`
- Production branch: `master`
- Root directory: repository root, or `apps/web`
- Framework preset: Vite
- Build command from repository root: `cd apps/web && npm run build`
- Output directory from repository root: `apps/web/dist`

The root `vercel.json` already sets the repository-root build commands. If you set Vercel's Root Directory to `apps/web`, use these settings instead:

- Build command: `npm run build`
- Output directory: `dist`

Frontend environment variable:

```text
VITE_API_BASE_URL=https://<your-api-service-url>
```

Do not set `VITE_API_BASE_URL` to the Vercel frontend URL. The value must point to the Spring Boot API service, for example Northflank or Render.

For automatic deploys, confirm Project Settings > Git has the GitHub repository connected and that Ignored Build Step is empty unless you intentionally skip builds.

## 5. Free-Tier Notes

- Render free services can sleep when idle, so the first request after inactivity may be slow.
- Northflank Sandbox is intended for prototypes, tests, and hobby projects. Upgrade before production traffic grows.
- Supabase free projects have quota limits. Use it for prototypes and small MVPs, then upgrade when real usage begins.
- Keep secrets only in Vercel, Render, and Supabase dashboards.
