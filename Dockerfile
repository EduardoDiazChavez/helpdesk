FROM node:20-alpine AS base
RUN apk add --no-cache openssl sqlite
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client and build Next.js
RUN npx prisma generate
RUN npm run build

# Prepare runtime image (SQLite lives inside the container by default)
ENV NODE_ENV=production
ENV DATABASE_URL="file:./prisma/dev.db"
EXPOSE 3000

# Push schema and seed on container start if the DB is empty
CMD npx prisma db push && npm run db:seed && npm run start
