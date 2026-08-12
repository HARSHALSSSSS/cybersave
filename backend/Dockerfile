# Cybersave Backend — Railway / production Docker image
# Multi-stage: build NestJS, then run a slim Node image.

FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# ─── Production runner ───────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

RUN apk add --no-cache openssl wget \
  && addgroup -S cybersave \
  && adduser -S cybersave -G cybersave

COPY package.json package-lock.json ./

# Production deps + prisma CLI + ts-node (auto-seed on first boot)
RUN npm ci --omit=dev \
  && npm install prisma@6.8.2 ts-node@10.9.2 typescript@5.7.3 --no-save \
  && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
COPY scripts/docker-entrypoint.js ./scripts/docker-entrypoint.js

RUN mkdir -p storage \
  && chown -R cybersave:cybersave /app

USER cybersave

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-8000}/api/v1/health" || exit 1

CMD ["node", "scripts/docker-entrypoint.js"]
