-- Complete database migration to fix all schema issues on remote server
-- This script will align the remote database with the local schema

-- ============================================================================
-- PART 1: Fix CRIANCA table column names (camelCase -> snake_case)
-- ============================================================================

-- Check and rename dataNascimento to data_nascimento
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'crianca' 
  AND COLUMN_NAME = 'dataNascimento';

SET @query = IF(@col_exists > 0, 
    'ALTER TABLE crianca CHANGE COLUMN dataNascimento data_nascimento DATE NULL', 
    'SELECT "Column dataNascimento does not exist or already renamed" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add data_nascimento if it doesn't exist at all
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'crianca' 
  AND COLUMN_NAME = 'data_nascimento';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE crianca ADD COLUMN data_nascimento DATE NULL AFTER nome', 
    'SELECT "Column data_nascimento already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- PART 2: Fix RESPONSAVEL table - add enderecoId if missing
-- ============================================================================

SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'responsavel' 
  AND COLUMN_NAME = 'enderecoId';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE responsavel ADD COLUMN enderecoId INT NULL AFTER estado', 
    'SELECT "Column enderecoId already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- PART 3: Fix PAGAMENTO table - ensure all required columns exist
-- ============================================================================

-- Add criancaId if missing
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'pagamento' 
  AND COLUMN_NAME = 'criancaId';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE pagamento ADD COLUMN criancaId INT NULL AFTER responsavelId', 
    'SELECT "Column criancaId already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add contrato_id if missing
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'pagamento' 
  AND COLUMN_NAME = 'contrato_id';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE pagamento ADD COLUMN contrato_id INT NULL AFTER criancaId', 
    'SELECT "Column contrato_id already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add admin_id if missing
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'pagamento' 
  AND COLUMN_NAME = 'admin_id';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE pagamento ADD COLUMN admin_id INT NULL AFTER status', 
    'SELECT "Column admin_id already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- PART 4: Add foreign key constraints if they don't exist
-- ============================================================================

-- Foreign key for pagamento.criancaId
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'pagamento' 
  AND CONSTRAINT_NAME = 'fk_pagamento_crianca';

SET @query = IF(@fk_exists = 0, 
    'ALTER TABLE pagamento ADD CONSTRAINT fk_pagamento_crianca FOREIGN KEY (criancaId) REFERENCES crianca(id) ON DELETE CASCADE', 
    'SELECT "Foreign key fk_pagamento_crianca already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign key for pagamento.contrato_id
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'pagamento' 
  AND CONSTRAINT_NAME = 'fk_pagamento_contrato';

SET @query = IF(@fk_exists = 0, 
    'ALTER TABLE pagamento ADD CONSTRAINT fk_pagamento_contrato FOREIGN KEY (contrato_id) REFERENCES contrato(id) ON DELETE CASCADE', 
    'SELECT "Foreign key fk_pagamento_contrato already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign key for pagamento.admin_id
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'pagamento' 
  AND CONSTRAINT_NAME = 'pagamento_ibfk_2';

SET @query = IF(@fk_exists = 0, 
    'ALTER TABLE pagamento ADD CONSTRAINT pagamento_ibfk_2 FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE', 
    'SELECT "Foreign key pagamento_ibfk_2 already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- PART 5: Show final schema for verification
-- ============================================================================

SELECT '=== CRIANCA TABLE ===' AS '';
DESCRIBE crianca;

SELECT '=== RESPONSAVEL TABLE ===' AS '';
DESCRIBE responsavel;

SELECT '=== PAGAMENTO TABLE ===' AS '';
DESCRIBE pagamento;

SELECT '=== ESCOLA TABLE ===' AS '';
DESCRIBE escola;

SELECT 'Migration completed successfully!' AS '';
