# --- Stage 1: build the static bundle -----------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Install from the lockfile so the image is reproducible (same as CI's npm ci).
COPY package.json package-lock.json ./
RUN npm ci

# Vite inlines env vars at build time, so the API URL is a build arg, overridable
# per environment (local, staging, prod) without touching the source.
ARG VITE_API_BASE_URL=http://localhost:8000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# --- Stage 2: serve the bundle with nginx -------------------------------------
FROM nginx:1.27-alpine AS runtime

# SPA config: unknown routes fall back to index.html (client-side routing).
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
