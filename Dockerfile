# Base image
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y openssl
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm install

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner stage
FROM base AS runner
ENV NODE_ENV production

# Create data directory for SQLite
RUN mkdir -p /app/data /app/uploads

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Set default env for SQLite if not provided
ENV DATABASE_URL="file:/app/data/prod.db"

# Start the application
CMD npx prisma db push && npm start
