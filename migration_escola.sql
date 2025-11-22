CREATE TABLE IF NOT EXISTS escola (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco VARCHAR(255),
    contato VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(100),
    admin_id INT NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admin(id)
);

ALTER TABLE crianca
ADD COLUMN data_nascimento DATE AFTER nome,
ADD COLUMN escola_id INT AFTER escola;

ALTER TABLE crianca
ADD CONSTRAINT fk_crianca_escola
FOREIGN KEY (escola_id) REFERENCES escola(id);

-- Migrate existing escola data (optional, but good practice if possible, though data is string)
-- For now we just leave the old column 'escola' as is until we verify migration, 
-- but the plan said "Modify escola column". 
-- Safer to keep both for a moment or just add new one. 
-- The ALTER above adds escola_id. We will eventually drop 'escola' or ignore it.
