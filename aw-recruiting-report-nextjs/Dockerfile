# ==============================================================================
# Multi-stage Dockerfile for Next.js 15 & Prisma (Standalone Mode)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Base Image
# ------------------------------------------------------------------------------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ------------------------------------------------------------------------------
# 2. Dependencies
# ------------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --legacy-peer-deps

# ------------------------------------------------------------------------------
# 3. Builder
# ------------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client for Linux Alpine when schema exists; ensure dirs exist for runner
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi && \
    mkdir -p /app/prisma /app/output /app/public

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application in standalone output mode
RUN npm run build

# ------------------------------------------------------------------------------
# 4. Production Runner
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

# Create secure non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets & standalone application
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/output ./output

USER nextjs

EXPOSE 3002

CMD ["node", "server.js"]
