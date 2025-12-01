FROM node:20-alpine AS base
RUN apk add --no-cache openssl sqlite
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS dev
ENV NODE_ENV=development
ENV PORT=8081
COPY . .
RUN npx prisma generate
CMD npm run dev -- -H 0.0.0.0 -p ${PORT}

FROM deps AS build
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8081
ENV DATABASE_URL="file:./prisma/dev.db"
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 8081
CMD npx prisma db push && npm run db:seed && npm run start -- -H 0.0.0.0 -p ${PORT}
