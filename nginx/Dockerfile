# Etapa 1: Compilación de Angular
FROM node:20-alpine AS builder
WORKDIR /app
# Copiamos solo lo necesario para instalar dependencias primero (cache)
COPY frontend/aether-web/package.json ./
RUN npm install
# Copiamos el resto del código de Angular
COPY frontend/aether-web/ .
RUN npm run build

# Etapa 2: Servidor Nginx
FROM nginx:1.27-alpine AS final

RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/aether.key \
      -out    /etc/nginx/ssl/aether.crt \
      -subj "/C=ES/ST=Canarias/L=Puerto de la Cruz/O=AETHER Radio/CN=localhost"

# Copiamos el build de Angular desde la etapa anterior
COPY --from=builder /app/dist/aether-web/browser /usr/share/nginx/html

# Copiamos la configuración de Nginx desde la carpeta nginx del proyecto
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
