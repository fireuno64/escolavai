#!/bin/bash

# Script de backup do banco de dados MySQL
# Escola Vai - Oracle Cloud

BACKUP_DIR="/home/ubuntu/backups"
DB_NAME="escolavai_db"
DB_USER="root"
DB_PASSWORD="Aa135790*"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/escolavai_backup_$DATE.sql"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

echo "Iniciando backup do banco de dados..."
echo "Arquivo: $BACKUP_FILE"

# Fazer backup
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_FILE

# Comprimir backup
gzip $BACKUP_FILE

echo "Backup concluído: ${BACKUP_FILE}.gz"

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "escolavai_backup_*.sql.gz" -mtime +7 -delete

echo "Backups antigos removidos (mantendo últimos 7 dias)"
