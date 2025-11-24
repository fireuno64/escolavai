#!/bin/bash

# Script de deploy da aplicação Escola Vai
# Oracle Cloud Deployment

set -e

APP_DIR="/home/ubuntu/escolavai"
DB_HOST="localhost"
DB_USER="escolavai_user"
DB_PASSWORD="Aa135790*"
DB_NAME="escolavai_db"
JWT_SECRET="Aa135790*"

echo "=========================================="
echo "Deploy da Aplicação Escola Vai"
echo "=========================================="

# Verificar se o diretório existe
if [ ! -d "$APP_DIR" ]; then
    echo "ERRO: Diretório $APP_DIR não encontrado!"
    echo "Por favor, transfira os arquivos da aplicação primeiro."
    exit 1
fi

cd $APP_DIR

echo ""
echo "Instalando dependências do Node.js..."
npm install

echo ""
echo "Instalando dependências do Python (chatbot)..."
cd chatbot
pip3 install -r requirements.txt
cd ..

echo ""
echo "Compilando TypeScript..."
npm run build

echo ""
echo "Criando arquivo .env de produção..."
cat > .env << EOF
# Database Configuration
DB_HOST=${DB_HOST}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_PORT=3306

# JWT Configuration
JWT_SECRET=${JWT_SECRET}

# Chatbot Configuration
CHATBOT_API_URL=http://localhost:5000/api/chat

# Server Configuration
NODE_ENV=production
PORT=3000
EOF

echo ""
echo "Executando setup do banco de dados..."
node --import tsx ./src/setup_db.ts || echo "Setup do banco executado (pode haver warnings se já existir)"

echo ""
echo "Criando usuário master (admin)..."
node --import tsx ./create_master_user.ts || echo "Usuário master já existe ou foi criado"

echo ""
echo "Parando processos PM2 existentes (se houver)..."
pm2 delete all || true

echo ""
echo "Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js

echo ""
echo "Salvando configuração do PM2..."
pm2 save

echo ""
echo "=========================================="
echo "Deploy concluído com sucesso!"
echo "=========================================="
echo ""
echo "Status da aplicação:"
pm2 status

echo ""
echo "Para ver os logs:"
echo "  pm2 logs"
echo ""
echo "Para reiniciar:"
echo "  pm2 restart all"
echo ""
echo "Para parar:"
echo "  pm2 stop all"
