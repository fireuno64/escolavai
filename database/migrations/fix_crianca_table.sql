-- Fix crianca table - add missing columns with snake_case names
-- This migration adds all columns that the code expects but are missing on remote server

SET @dbname = DATABASE();
SET @tablename = 'crianca';

-- Add escola_id if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'escola_id';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE crianca ADD COLUMN escola_id INT NULL AFTER data_nascimento', 
    'SELECT "Column escola_id already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add horario_entrada if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'horario_entrada';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE crianca ADD COLUMN horario_entrada TIME NULL AFTER horario', 
    'SELECT "Column horario_entrada already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add horario_saida if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'horario_saida';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE crianca ADD COLUMN horario_saida TIME NULL AFTER horario_entrada', 
    'SELECT "Column horario_saida already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add tipo_transporte if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'tipo_transporte';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE crianca ADD COLUMN tipo_transporte ENUM(\'ida_volta\', \'so_ida\', \'so_volta\') DEFAULT \'ida_volta\' AFTER horario_saida', 
    'SELECT "Column tipo_transporte already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add data_inicio_contrato if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'data_inicio_contrato';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE crianca ADD COLUMN data_inicio_contrato DATE NULL AFTER valor_contrato_anual', 
    'SELECT "Column data_inicio_contrato already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for escola_id if it doesn't exist
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND CONSTRAINT_NAME = 'fk_crianca_escola';

SET @query = IF(@fk_exists = 0, 
    'ALTER TABLE crianca ADD CONSTRAINT fk_crianca_escola FOREIGN KEY (escola_id) REFERENCES escola(id)', 
    'SELECT "Foreign key fk_crianca_escola already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Show final schema
DESCRIBE crianca;
