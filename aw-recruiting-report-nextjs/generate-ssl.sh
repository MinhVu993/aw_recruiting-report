#!/bin/bash
set -e

# Cấu hình IP hoặc Domain của bạn tại đây
TARGET_IP="10.13.34.160"

mkdir -p ssl

if command -v openssl >/dev/null 2>&1; then
    echo "Generating SSL cert using local OpenSSL for ${TARGET_IP} and localhost..."
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
      -keyout ssl/server.key \
      -out ssl/server.crt \
      -subj "/C=VN/ST=HCM/L=HCM/O=MyCompany/OU=IT/CN=${TARGET_IP}" \
      -addext "subjectAltName=IP:${TARGET_IP},IP:127.0.0.1,DNS:localhost"
else
    echo "OpenSSL not found. Generating cert using Docker alpine/openssl..."
    docker run --rm -v "$(pwd)/ssl:/ssl" alpine/openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
      -keyout /ssl/server.key \
      -out /ssl/server.crt \
      -subj "/C=VN/ST=HCM/L=HCM/O=MyCompany/OU=IT/CN=${TARGET_IP}" \
      -addext "subjectAltName=IP:${TARGET_IP},IP:127.0.0.1,DNS:localhost"
fi

chmod 644 ssl/server.crt ssl/server.key 2>/dev/null || true
echo "SSL certificate successfully generated in ssl/ directory."
