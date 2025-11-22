-- Add separate address fields to responsavel table
ALTER TABLE responsavel 
ADD COLUMN cep VARCHAR(10) NULL AFTER endereco,
ADD COLUMN numero VARCHAR(20) NULL AFTER cep,
ADD COLUMN complemento VARCHAR(100) NULL AFTER numero;

-- Add separate address fields to escola table  
ALTER TABLE escola
ADD COLUMN cep VARCHAR(10) NULL AFTER endereco,
ADD COLUMN numero VARCHAR(20) NULL AFTER cep,
ADD COLUMN complemento VARCHAR(100) NULL AFTER numero;
