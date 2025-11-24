#!/bin/bash

# Script de configuração do MySQL
# Escola Vai - Oracle Cloud Deployment

set -e

echo "=========================================="
echo "Configurando MySQL..."
echo "=========================================="

DB_NAME="escolavai_db"
DB_USER="escolavai_user"
DB_PASSWORD="Aa135790*"
DB_ROOT_PASSWORD="Aa135790*"

echo ""
echo "Configurando senha do root do MySQL..."

# Configurar senha do root
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_ROOT_PASSWORD}';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo ""
echo "Criando banco de dados e usuário..."

# Criar banco de dados
mysql -u root -p${DB_ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Criar usuário
mysql -u root -p${DB_ROOT_PASSWORD} -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"

# Conceder permissões
mysql -u root -p${DB_ROOT_PASSWORD} -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -u root -p${DB_ROOT_PASSWORD} -e "FLUSH PRIVILEGES;"

echo ""
echo "=========================================="
echo "MySQL configurado com sucesso!"
echo "=========================================="
echo ""
echo "Detalhes da configuração:"
echo "- Banco de dados: ${DB_NAME}"
echo "- Usuário: ${DB_USER}"
echo "- Host: localhost"
echo ""
echo "IMPORTANTE: Anote estas credenciais!"
echo ""
echo "Próximo passo: Transfira os arquivos da aplicação e execute ./deploy-app.sh"
