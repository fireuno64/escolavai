-- Fix crianca table based on actual remote schema
-- Add missing columns and rename responsavelId to responsavel_id

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
    'ALTER TABLE crianca ADD COLUMN escola_id INT NULL AFTER escola', 
    'SELECT "Column escola_id already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add horario if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'horario';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE crianca ADD COLUMN horario VARCHAR(50) NULL AFTER escola_id', 
    'SELECT "Column horario already exists" AS message');
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

-- Rename responsavelId to responsavel_id if needed
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'responsavelId';

SET @query = IF(@col_exists > 0, 
    'ALTER TABLE crianca CHANGE COLUMN responsavelId responsavel_id INT NOT NULL', 
    'SELECT "Column responsavelId already renamed or does not exist" AS message');
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
SELECT 'Migration completed! Final schema:' AS '';
DESCRIBE crianca;
