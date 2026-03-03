# Stage 1: Build the Vite Application
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN export NODE_ENV=development && npm install

COPY . .
RUN export NODE_ENV=development && npm run build

# Stage 2: Serve the build via Nginx (Stateless, Fast and Production Ready)
FROM nginx:alpine AS runner

# Remover HTML padrao do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os assets buildados do react para a pasta publica do nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração customizada do Nginx para suportar React Router (Fallback to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Appuser pattern implementation internally provided by nginx unprivileged mode / or standard alpine
EXPOSE 80

# Health check exigido pelo Coolify e SecOps
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
