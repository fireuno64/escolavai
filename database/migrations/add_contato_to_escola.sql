-- Add missing columns to escola table
-- Note: If columns already exist, the script will handle the error gracefully

ALTER TABLE escola ADD COLUMN contato VARCHAR(255) NULL AFTER estado;
ALTER TABLE escola ADD COLUMN telefone VARCHAR(20) NULL AFTER contato;
ALTER TABLE escola ADD COLUMN email VARCHAR(255) NULL AFTER telefone;
