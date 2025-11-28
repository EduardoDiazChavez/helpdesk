# Helpdesk

Next.js + Prisma (SQLite) helpdesk app.

## Run with Docker Compose
- Production build on port 8081: `docker compose up --build` (app at http://localhost:8081)
- Dev + hot reload on port 8081 with persistent DB/uploads: `docker compose -f docker-compose.dev.yml up --build`
- Seed the dev database with `docker compose -f docker-compose.dev.yml exec helpdesk sh -c "npx prisma db push --accept-data-loss && npm run db:seed` container must be running.
- Data persists via named volumes: `prisma-data` (SQLite for both prod/dev) and `request-pictures` (uploads)
- To reset everything: `docker compose down -v` (prod) or `docker compose -f docker-compose.dev.yml down -v`

## Local development
- Install deps: `npm install`
- Run dev server on 8081 for parity: `PORT=8081 npm run dev`
- Prisma helpers: `npm run db:push`, `npm run db:seed`, `npm run prisma:generate`, `npx prisma studio`
