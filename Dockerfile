# Multi-stage build for efficient Next.js client application
# Based on official Next.js Docker example with optimizations

FROM node:22-alpine AS base
LABEL maintainer="sas"

# Install dependencies only when needed
FROM base AS deps
# Install libc6-compat for compatibility with native modules (sharp, canvas, etc.)
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package manager files
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies based on the preferred package manager
# Supports npm, yarn, or pnpm with intelligent detection
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Build arguments for environment variables (can be overridden at build time)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ENABLE_CMS
ARG NEXT_PUBLIC_FALLBACK_TIMEOUT
ARG NEXT_PUBLIC_CACHE_DURATION

# Set environment variables for the build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_ENABLE_CMS=${NEXT_PUBLIC_ENABLE_CMS}
ENV NEXT_PUBLIC_FALLBACK_TIMEOUT=${NEXT_PUBLIC_FALLBACK_TIMEOUT}
ENV NEXT_PUBLIC_CACHE_DURATION=${NEXT_PUBLIC_CACHE_DURATION}

# Build the Next.js application
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image - minimal and secure
FROM base AS runner
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Disable telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED=1

# Create system user and group for security (non-root)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Create .next directory with proper permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy Next.js standalone build output (optimized for production)
# This includes only the necessary files to run the application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user for security
USER nextjs

# Expose port 3000
EXPOSE 3000

# Set port environment variable
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check to ensure the container is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the Next.js server using the standalone build
CMD ["node", "server.js"]
