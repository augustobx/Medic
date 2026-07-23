# ─── Build Stage ──────────────────────────────
FROM node:20-alpine AS builder

# Required for some native packages in Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ─── Production Stage ─────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Required for some native packages in Alpine
RUN apk add --no-cache libc6-compat

RUN addgroup -g 1001 -S nextjs && \
    adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
