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

Render and Supabase-style `postgresql://...` or `postgres://...` URLs are converted to `jdbc:postgresql://...` automatically.

## 2. Render Backend (Recommended)

Use the repository root `render.yaml` blueprint for the fastest setup.

Render steps:

- Create a new Blueprint on Render from `oocheol/new-project-4`
- Branch: `master`
- Blueprint file path: `render.yaml`
- Apply blueprint

The blueprint provisions:

- PostgreSQL database: `han-studio-db` (free)
- Web service: `han-studio-api` (free, Docker)

If you create the Web Service manually instead of using blueprint:

- Root directory: repository root
- Runtime: Docker
- Dockerfile path: `apps/api/Dockerfile`
- Docker build context: `apps/api`
- Health check path: `/api/health`

Environment variables:

```text
SPRING_DATASOURCE_URL=<your-postgres-url>
SPRING_DATASOURCE_USERNAME=<your-db-user-if-not-in-url>
SPRING_DATASOURCE_PASSWORD=<your-db-password-if-not-in-url>
ALLOWED_ORIGINS=https://<your-vercel-domain>
```

If you use the blueprint, datasource variables are auto-connected from the Render database.

After Render gives you a public service URL, update the Vercel frontend variable:

```text
VITE_API_BASE_URL=https://<your-render-service>.onrender.com
```

Then redeploy the Vercel frontend.

## 3. Vercel Frontend

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

Do not set `VITE_API_BASE_URL` to the Vercel frontend URL. The value must point to the Spring Boot API service on Render.

For automatic deploys, confirm Project Settings > Git has the GitHub repository connected and that Ignored Build Step is empty unless you intentionally skip builds.

## 4. Free-Tier Notes

- Render free services can sleep when idle, so the first request after inactivity may be slow.
- Supabase free projects have quota limits. Use it for prototypes and small MVPs, then upgrade when real usage begins.
- Keep secrets only in Vercel, Render, and Supabase dashboards.
