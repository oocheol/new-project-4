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

Render Blueprint `connectionString` values use `postgresql://...`; the API converts those values to `jdbc:postgresql://...` automatically.

## 2. Koyeb Backend

Koyeb is a good free backend target for the Spring Boot API. Use the existing Dockerfile in `apps/api`.

Create a Koyeb Web Service from GitHub:

- Repository: `oocheol/new-project-4`
- Branch: `master`
- Builder: Dockerfile
- Root directory / work directory: `apps/api`
- Dockerfile path: `Dockerfile`
- Instance type: `free`
- Region: Washington, D.C. or Frankfurt
- Exposed port: `8080`
- Health check path: `/api/health`

Environment variables:

```text
SPRING_DATASOURCE_URL=<your-postgres-url>
SPRING_DATASOURCE_USERNAME=<your-db-user-if-not-in-url>
SPRING_DATASOURCE_PASSWORD=<your-db-password-if-not-in-url>
ALLOWED_ORIGINS=https://<your-vercel-domain>
```

If you use a Render/Supabase-style `postgresql://...` or `postgres://...` database URL, the API converts it to a JDBC URL automatically at startup.

After Koyeb gives you a public service URL, update the Vercel frontend variable:

```text
VITE_API_BASE_URL=https://<your-koyeb-service>.koyeb.app
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

Do not set `VITE_API_BASE_URL` to the Vercel frontend URL. The value must point to the Spring Boot API service, for example Koyeb or Render.

For automatic deploys, confirm Project Settings > Git has the GitHub repository connected and that Ignored Build Step is empty unless you intentionally skip builds.

## 5. Free-Tier Notes

- Render free services can sleep when idle, so the first request after inactivity may be slow.
- Koyeb free services scale down after inactivity, so the first request after idle time can still be slower than a paid always-on service.
- Supabase free projects have quota limits. Use it for prototypes and small MVPs, then upgrade when real usage begins.
- Keep secrets only in Vercel, Render, and Supabase dashboards.
