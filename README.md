# Han Studio Wedding Platform

웨딩 사진을 보고 마음에 맞는 소속 작가를 선택해 상담을 남기는 스튜디오 플랫폼입니다.

- Frontend: Vite JavaScript single-page app
- Backend: Spring Boot REST API
- Database: local persistent H2 by default, PostgreSQL-ready for deployment

## Product Flow

1. 커플은 한 스튜디오 포트폴리오 사진을 둘러봅니다.
2. 마음에 드는 사진이나 작가를 선택합니다.
3. 촬영일, 선호 무드, 연락처를 남기면 상담 요청이 DB에 저장됩니다.

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

The frontend reads `VITE_API_BASE_URL`. The backend uses `jdbc:h2:file:./data/han-studio` by default so local data persists across restarts. For PostgreSQL, set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`. Render-style `postgresql://...` and `postgres://...` URLs are converted to JDBC URLs at startup.

## Main API

- `GET /api/studio`: photographers and portfolio photos
- `GET /api/photographers`: studio photographers
- `GET /api/portfolio`: portfolio photos
- `POST /api/portfolio`: save a new portfolio photo URL
- `POST /api/inquiries`: save a booking inquiry
- `GET /api/inquiries`: saved inquiries

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Render, Vercel, and Supabase setup. See [docs/ORACLE_DEPLOYMENT.md](docs/ORACLE_DEPLOYMENT.md) for Oracle Always Free VM deployment.

## AI Contributor Entry Point

Start with [docs/AI_GUIDE.md](docs/AI_GUIDE.md). It explains where product, API, database, and deployment work should live.
