
-- Add address fields to admin table
ALTER TABLE admin ADD COLUMN cep VARCHAR(10) AFTER endereco;
ALTER TABLE admin ADD COLUMN rua VARCHAR(255) AFTER cep;
ALTER TABLE admin ADD COLUMN numero VARCHAR(20) AFTER rua;
ALTER TABLE admin ADD COLUMN complemento VARCHAR(255) AFTER numero;
ALTER TABLE admin ADD COLUMN bairro VARCHAR(100) AFTER complemento;
ALTER TABLE admin ADD COLUMN cidade VARCHAR(100) AFTER bairro;
ALTER TABLE admin ADD COLUMN estado VARCHAR(2) AFTER cidade;

-- Add address fields to responsavel table
ALTER TABLE responsavel ADD COLUMN cep VARCHAR(10) AFTER endereco;
ALTER TABLE responsavel ADD COLUMN rua VARCHAR(255) AFTER cep;
ALTER TABLE responsavel ADD COLUMN numero VARCHAR(20) AFTER rua;
ALTER TABLE responsavel ADD COLUMN complemento VARCHAR(255) AFTER numero;
ALTER TABLE responsavel ADD COLUMN bairro VARCHAR(100) AFTER complemento;
ALTER TABLE responsavel ADD COLUMN cidade VARCHAR(100) AFTER bairro;
ALTER TABLE responsavel ADD COLUMN estado VARCHAR(2) AFTER cidade;

-- Add address fields to escola table
ALTER TABLE escola ADD COLUMN cep VARCHAR(10) AFTER endereco;
ALTER TABLE escola ADD COLUMN rua VARCHAR(255) AFTER cep;
ALTER TABLE escola ADD COLUMN numero VARCHAR(20) AFTER rua;
ALTER TABLE escola ADD COLUMN complemento VARCHAR(255) AFTER numero;
ALTER TABLE escola ADD COLUMN bairro VARCHAR(100) AFTER complemento;
ALTER TABLE escola ADD COLUMN cidade VARCHAR(100) AFTER bairro;
ALTER TABLE escola ADD COLUMN estado VARCHAR(2) AFTER cidade;
