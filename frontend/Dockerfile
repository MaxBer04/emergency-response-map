FROM oven/bun:latest AS dev

WORKDIR /app

# Copy package files
COPY package.json .
COPY bun.lock* .
RUN bun install

# Copy the rest of the app
COPY . .

EXPOSE 3001

# In dev, start Vite with host and port configuration
CMD ["bun", "run", "dev", "--host", "0.0.0.0", "--port", "3001"]

# Production build stage
FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json .
COPY bun.lock* .
RUN bun install
COPY . .
RUN bun run build

# Production runtime
FROM nginx:alpine AS prod
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]