# ─── Build Stage ──────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# ─── Production Deps Stage ────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

# Install prisma CLI for migrations
RUN npm install prisma --no-save

# ─── Production Stage ─────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nestjs && \
    adduser -S nestjs -u 1001

COPY --chown=nestjs:nestjs --from=builder /app/dist ./dist
COPY --chown=nestjs:nestjs --from=deps /app/node_modules ./node_modules
COPY --chown=nestjs:nestjs --from=builder /app/package*.json ./
COPY --chown=nestjs:nestjs --from=builder /app/prisma ./prisma

RUN mkdir -p /app/uploads && chown -R nestjs:nestjs /app/uploads

USER nestjs

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
