# Java API + JS Web Starter

Java Spring Boot backend, JavaScript Vite frontend, and PostgreSQL-ready configuration for a free-tier deployment path:

- Frontend: Vercel
- Backend: Render
- Database: Supabase PostgreSQL

## Project Map

```text
apps/
  api/          Spring Boot REST API
  web/          Vite JavaScript frontend
docs/           Human and AI contributor notes
infra/          Deployment blueprints and service notes
```

## Local Development

Frontend:

```bash
cd apps/web
npm install
npm run dev
```

Backend:

```bash
cd apps/api
gradle bootRun
```

The frontend reads `VITE_API_BASE_URL`. The backend reads PostgreSQL settings from `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD`.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Vercel, Render, and Supabase setup.

## AI Contributor Entry Point

Start with [docs/AI_GUIDE.md](docs/AI_GUIDE.md). It explains where product, API, database, and deployment work should live.
