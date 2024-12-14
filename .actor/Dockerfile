# Base image with pnpm setup
FROM apify/actor-node-playwright-chrome:22 AS base

USER root
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

USER myuser

# Builder stage
FROM base AS builder

# Copy only necessary files for dependency installation
COPY --chown=myuser package.json pnpm-lock.yaml ./

# Install dependencies and verify installation in a single layer
RUN NODE_ENV=development corepack pnpm install --frozen-lockfile \
    && corepack pnpm list crawlee apify puppeteer playwright \
    && echo "Installed packages:" \
    && corepack pnpm list

# Install all dependencies using pnpm
RUN NODE_ENV=development corepack pnpm install --frozen-lockfile && \
    echo "Installed packages:" && \
    corepack pnpm list

# Copy source files
COPY --chown=myuser . ./

# Build the project
RUN corepack pnpm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Copy package files and install production dependencies in a single layer
COPY --chown=myuser package.json pnpm-lock.yaml ./
RUN corepack pnpm install --prod --frozen-lockfile --prefer-offline \
    && corepack pnpm store prune \
    && rm -rf ~/.cache/pnpm

# Copy only the necessary files from builder
COPY --from=builder --chown=myuser /home/myuser/dist ./dist

# Run the image
CMD ./start_xvfb_and_run_cmd.sh && corepack pnpm run start:prod --silent
