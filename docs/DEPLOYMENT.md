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

## 2. Render Backend

Create a new Web Service from this repository.

- Root directory: `apps/api`
- Runtime: Docker
- Dockerfile path: `apps/api/Dockerfile`

You can also use `infra/render.yaml` as a blueprint reference.

## 3. Vercel Frontend

Create a Vercel project from this repository.

- Root directory: `apps/web`
- Build command: `npm run build`
- Output directory: `dist`

Frontend environment variable:

```text
VITE_API_BASE_URL=https://<your-render-service>.onrender.com
```

## 4. Free-Tier Notes

- Render free services can sleep when idle, so the first request after inactivity may be slow.
- Supabase free projects have quota limits. Use it for prototypes and small MVPs, then upgrade when real usage begins.
- Keep secrets only in Vercel, Render, and Supabase dashboards.
