-- Migration script to fix escola table schema on remote server
-- This adds all missing columns that exist in the local schema but not on remote

-- Check if columns exist before adding them (safe migration)
SET @dbname = DATABASE();
SET @tablename = 'escola';

-- Add cep column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'cep';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE escola ADD COLUMN cep VARCHAR(10) NULL AFTER endereco', 
    'SELECT "Column cep already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add rua column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'rua';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE escola ADD COLUMN rua VARCHAR(255) NULL AFTER cep', 
    'SELECT "Column rua already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add numero column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'numero';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE escola ADD COLUMN numero VARCHAR(20) NULL AFTER rua', 
    'SELECT "Column numero already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add complemento column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'complemento';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE escola ADD COLUMN complemento VARCHAR(100) NULL AFTER numero', 
    'SELECT "Column complemento already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add bairro column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'bairro';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE escola ADD COLUMN bairro VARCHAR(100) NULL AFTER complemento', 
    'SELECT "Column bairro already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add cidade column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'cidade';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE escola ADD COLUMN cidade VARCHAR(100) NULL AFTER bairro', 
    'SELECT "Column cidade already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add estado column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'estado';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE escola ADD COLUMN estado VARCHAR(2) NULL AFTER cidade', 
    'SELECT "Column estado already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add contato column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'contato';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE escola ADD COLUMN contato VARCHAR(100) NULL AFTER estado', 
    'SELECT "Column contato already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add telefone column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'telefone';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE escola ADD COLUMN telefone VARCHAR(20) NULL AFTER contato', 
    'SELECT "Column telefone already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add email column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'email';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE escola ADD COLUMN email VARCHAR(100) NULL AFTER telefone', 
    'SELECT "Column email already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add admin_id column if it doesn't exist (CRITICAL - this is causing the main error)
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'admin_id';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE escola ADD COLUMN admin_id INT NULL AFTER email', 
    'SELECT "Column admin_id already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing records to set admin_id to 1 (assuming first admin)
-- Only if admin_id column was just added
UPDATE escola SET admin_id = 1 WHERE admin_id IS NULL;

-- Now make admin_id NOT NULL
ALTER TABLE escola MODIFY COLUMN admin_id INT NOT NULL;

-- Add foreign key constraint if it doesn't exist
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND CONSTRAINT_NAME = 'escola_ibfk_1';

SET @query = IF(@fk_exists = 0, 
    'ALTER TABLE escola ADD CONSTRAINT escola_ibfk_1 FOREIGN KEY (admin_id) REFERENCES admin(id)', 
    'SELECT "Foreign key escola_ibfk_1 already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Show final schema
DESCRIBE escola;
