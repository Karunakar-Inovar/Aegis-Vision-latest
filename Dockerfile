# Stage 1: Build the Next.js app
FROM node:20-slim AS builder
WORKDIR /app

# Ensure Yarn Classic (v1) is available (some Node images don't include Yarn v1)
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
 
# Copy root manifests and tsconfig so Next can find root config
COPY package.json yarn.lock turbo.json tsconfig.json ./
 
# Copy workspace manifests needed for install and build
COPY apps/web/package.json ./apps/web/package.json
COPY apps ./apps
COPY packages ./packages
 
# Use Yarn v1 (classic) already present in image; install deps
RUN yarn install --frozen-lockfile
 
# Build the web workspace (runs `next build` in apps/web)
RUN yarn dev:build
 
# Stage 2: Production image
FROM node:20-slim AS runner
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
 
# Copy only what is needed to run the built Next app under apps/web
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

# Copy root lockfile so installs are deterministic
COPY --from=builder /app/yarn.lock ./yarn.lock

# Install only production deps for the `web` workspace into its folder
RUN yarn --cwd apps/web install --production --frozen-lockfile

# Expose the port Next will run on
EXPOSE 3000

# Start the Next.js server from the web workspace
CMD ["yarn", "--cwd", "apps/web", "start"]