# AI Contributor Guide

This repository is intentionally split by deploy target so future AI work can stay scoped.

## Where To Work

- Frontend UI and browser behavior: `apps/web`
- Backend endpoints and business logic: `apps/api/src/main/java`
- Backend configuration: `apps/api/src/main/resources`
- Deployment instructions: `docs/DEPLOYMENT.md`
- Render blueprint: `infra/render.yaml`

## Rules Of Thumb

- Keep frontend API calls in `apps/web/src/api.js`.
- Keep backend HTTP routes under `apps/api/src/main/java/com/example/starter/notes`.
- Add database schema changes as migrations under `apps/api/src/main/resources/db/migration` once Flyway is introduced.
- Do not commit real `.env` files or secrets.
- Prefer small, named commits that describe the behavior changed.

## Current Stack

- Web: Vite with plain JavaScript modules
- API: Spring Boot 2.7.x on Java 11+ with Gradle
- DB: PostgreSQL, intended for Supabase
- Hosting: Vercel for web, Render for API

## Useful First Tasks

1. Replace the sample Notes domain with the real product domain.
2. Add authentication if user-owned data is needed.
3. Add Flyway migrations before introducing persistent tables.
4. Add CI after the first real feature lands.
