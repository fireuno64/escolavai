#!/bin/bash

# Script de instalação de dependências para Ubuntu 22.04
# Escola Vai - Oracle Cloud Deployment

set -e  # Exit on error

echo "=========================================="
echo "Instalando dependências do sistema..."
echo "=========================================="

# Atualizar sistema
sudo apt update
sudo apt upgrade -y

# Instalar utilitários básicos
sudo apt install -y curl wget git unzip build-essential

echo ""
echo "=========================================="
echo "Instalando Node.js 18.x..."
echo "=========================================="

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version

echo ""
echo "=========================================="
echo "Instalando PM2 (Process Manager)..."
echo "=========================================="

sudo npm install -g pm2

# Configurar PM2 para iniciar no boot
sudo pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo ""
echo "=========================================="
echo "Instalando Python 3 e pip..."
echo "=========================================="

sudo apt install -y python3 python3-pip python3-venv

# Verificar instalação
python3 --version
pip3 --version

echo ""
echo "=========================================="
echo "Instalando MySQL Server..."
echo "=========================================="

sudo apt install -y mysql-server

# Iniciar MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

echo ""
echo "=========================================="
echo "Instalando Nginx..."
echo "=========================================="

sudo apt install -y nginx

# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo ""
echo "=========================================="
echo "Configurando Firewall (UFW)..."
echo "=========================================="

# Configurar firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000/tcp  # Node.js backend
sudo ufw allow 5000/tcp  # Python chatbot
sudo ufw --force enable

echo ""
echo "=========================================="
echo "Instalação concluída!"
echo "=========================================="
echo ""
echo "Versões instaladas:"
echo "- Node.js: $(node --version)"
echo "- npm: $(npm --version)"
echo "- Python: $(python3 --version)"
echo "- MySQL: $(mysql --version)"
echo "- Nginx: $(nginx -v 2>&1)"
echo "- PM2: $(pm2 --version)"
echo ""
echo "Próximo passo: Execute ./setup-mysql.sh"
