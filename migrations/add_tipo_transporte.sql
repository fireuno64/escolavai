-- Migration 1: Add tipo_transporte column to crianca table
ALTER TABLE crianca 
ADD COLUMN tipo_transporte ENUM('ida_volta', 'so_ida', 'so_volta') DEFAULT 'ida_volta' 
AFTER horario_saida;

-- Migration 2: Add criancaId column to pagamento table
ALTER TABLE pagamento 
ADD COLUMN criancaId INT NULL AFTER responsavelId,
ADD CONSTRAINT fk_pagamento_crianca 
    FOREIGN KEY (criancaId) REFERENCES crianca(id) ON DELETE CASCADE;

-- Verify the changes
DESCRIBE crianca;
DESCRIBE pagamento;
