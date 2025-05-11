FROM node:18.18.0-alpine3.18 as base

# Stage 2: Install dependencies
FROM base AS deps
# Install libc6-compat for Alpine compatibility and build tools for native dependencies
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js app
RUN npm run build

# Debug: Check the contents of .next after build
RUN echo "Contents of /app/.next:" && ls -la /app/.next || echo "Directory .next not found"

# Stage 4: Runner for production
FROM base AS runner
WORKDIR /app

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Set up .next/cache/images directory with correct permissions
RUN mkdir -p .next/cache/images
RUN chown -R nextjs:nodejs .next

# Debug: Verify the directory structure in the runner stage
RUN echo "Contents of /app:" && ls -la /app && \
    echo "Contents of /app/.next:" && ls -la /app/.next && \
    echo "Contents of /app/.next/cache:" && ls -la /app/.next/cache && \
    echo "Contents of /app/.next/cache/images:" && ls -la /app/.next/cache/images || echo "Directory .next/cache/images not found" && \
    echo "Contents of /app/public:" && ls -la /app/public || echo "Directory public not found"

# Set environment variables
ENV PORT 3000
ENV NODE_ENV production

# Expose the port
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the app
CMD ["npm", "start"]