#!/bin/bash

# Script para configurar o Nginx
# Escola Vai - Oracle Cloud Deployment

set -e

echo "=========================================="
echo "Configurando Nginx..."
echo "=========================================="

NGINX_CONFIG="/etc/nginx/sites-available/escolavai"
NGINX_ENABLED="/etc/nginx/sites-enabled/escolavai"

# Copiar configuração
echo "Copiando arquivo de configuração..."
sudo cp nginx.conf $NGINX_CONFIG

# Remover configuração padrão
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "Removendo configuração padrão do Nginx..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# Criar link simbólico
echo "Ativando configuração..."
sudo ln -sf $NGINX_CONFIG $NGINX_ENABLED

# Testar configuração
echo "Testando configuração do Nginx..."
sudo nginx -t

# Reiniciar Nginx
echo "Reiniciando Nginx..."
sudo systemctl restart nginx

echo ""
echo "=========================================="
echo "Nginx configurado com sucesso!"
echo "=========================================="
echo ""
echo "A aplicação estará disponível em:"
echo "  http://129.148.22.95"
echo ""
