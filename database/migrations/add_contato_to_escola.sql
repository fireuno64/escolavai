-- Add ALL missing columns to escola table
-- This migration handles servers with incomplete schema

-- Core address fields
ALTER TABLE escola ADD COLUMN cep VARCHAR(10) NULL AFTER endereco;
ALTER TABLE escola ADD COLUMN rua VARCHAR(255) NULL AFTER cep;
ALTER TABLE escola ADD COLUMN numero VARCHAR(20) NULL AFTER rua;
ALTER TABLE escola ADD COLUMN complemento VARCHAR(100) NULL AFTER numero;
ALTER TABLE escola ADD COLUMN bairro VARCHAR(100) NULL AFTER complemento;
ALTER TABLE escola ADD COLUMN cidade VARCHAR(100) NULL AFTER bairro;
ALTER TABLE escola ADD COLUMN estado VARCHAR(2) NULL AFTER cidade;

-- Contact fields
ALTER TABLE escola ADD COLUMN contato VARCHAR(255) NULL AFTER estado;
ALTER TABLE escola ADD COLUMN telefone VARCHAR(20) NULL AFTER contato;
ALTER TABLE escola ADD COLUMN email VARCHAR(255) NULL AFTER telefone;

-- Foreign key
ALTER TABLE escola ADD COLUMN admin_id INT NOT NULL AFTER email;
ALTER TABLE escola ADD CONSTRAINT fk_escola_admin FOREIGN KEY (admin_id) REFERENCES admin(id);
