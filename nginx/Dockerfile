FROM nginx:1.27-alpine

# Genera certificado autofirmado para desarrollo local
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/aether.key \
      -out    /etc/nginx/ssl/aether.crt \
      -subj "/C=ES/ST=Canarias/L=Puerto de la Cruz/O=AETHER Radio/CN=localhost"

COPY nginx.conf /etc/nginx/nginx.conf
COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80 443
