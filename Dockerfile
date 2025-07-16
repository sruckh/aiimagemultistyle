# Stage 1: Build the application
FROM node:22.12-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies (skip prepare script to avoid premature build)
RUN npm ci --ignore-scripts

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Stage 2: Create lightweight production image
FROM node:22.12-alpine AS release

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/build ./build

# Copy production dependencies from builder (already built there)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

ENTRYPOINT ["node", "build/index.js"]