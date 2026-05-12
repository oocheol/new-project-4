# AI Contributor Guide

This repository is intentionally split by deploy target so future AI work can stay scoped.

## Where To Work

- Frontend UI and browser behavior: `apps/web`
- Backend endpoints and business logic: `apps/api/src/main/java`
- Backend configuration: `apps/api/src/main/resources`
- Deployment instructions: `docs/ORACLE_DEPLOYMENT.md`
- Oracle VM stack: `infra/oracle/docker-compose.yml`

## Rules Of Thumb

- Keep frontend API calls in `apps/web/src/api.js`.
- Keep backend HTTP routes under `apps/api/src/main/java/com/example/starter/magazine`.
- Add database schema changes as migrations under `apps/api/src/main/resources/db/migration` once Flyway is introduced.
- Do not commit real `.env` files or secrets.
- Prefer small, named commits that describe the behavior changed.

## Current Stack

- Web: Vite with plain JavaScript modules
- API: Spring Boot 2.7.x on Java 11+ with Gradle
- DB: H2 locally, PostgreSQL inside Oracle VM for deployment
- Hosting: Vercel for web, Oracle VM for API and DB

## Useful First Tasks

1. Refine the magazine information architecture and issue taxonomy.
2. Add authentication if editor-only publishing is needed.
3. Add migrations once the deployed schema should stop resetting.
4. Add CI after the first stable content workflow lands.
