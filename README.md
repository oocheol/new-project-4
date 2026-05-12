# Untitled Magazine

`무제 (Untitled)`는 빈 책 위에 사진과 글을 채워가는 온라인 잡지입니다.

- Frontend: Vite JavaScript single-page app
- Backend: Spring Boot REST API
- Database: local persistent H2 by default, PostgreSQL inside Oracle VM for deployment

## Product Flow

1. 독자는 이슈와 스토리를 목차처럼 탐색합니다.
2. 사진 책 뷰에서 한 장씩 넘기며 읽습니다.
3. 작성자는 사진과 글을 제출해 새로운 페이지를 만듭니다.

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

The frontend reads `VITE_API_BASE_URL`. The backend uses `jdbc:h2:file:./data/untitled-magazine` by default and recreates the new magazine schema. For deployment, the Oracle VM Docker stack runs PostgreSQL privately inside the VM and the Spring Boot API connects to it over the Docker network.

## Main API

- `GET /api/magazine/home`: brand info, issues, stories, photo pages
- `POST /api/magazine/stories`: save a new story page
- `POST /api/magazine/photo-pages`: save a new photo book page
- `POST /api/magazine/submissions`: save a reader submission
- `POST /api/magazine/stories/{id}/like`: like a story
- `POST /api/magazine/photo-pages/{id}/like`: like a photo page

## Deployment

See [docs/ORACLE_DEPLOYMENT.md](docs/ORACLE_DEPLOYMENT.md) for Oracle VM deployment. The frontend build settings live in [vercel.json](/C:/Users/PC/Documents/New%20project%204/vercel.json).

## AI Contributor Entry Point

Start with [docs/AI_GUIDE.md](docs/AI_GUIDE.md). It explains where product, API, database, and deployment work should live.
