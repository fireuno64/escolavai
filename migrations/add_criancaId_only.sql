-- Add criancaId column to pagamento table
-- This allows linking payments to specific children instead of just responsaveis

ALTER TABLE pagamento 
ADD COLUMN criancaId INT NULL AFTER responsavelId,
ADD CONSTRAINT fk_pagamento_crianca 
    FOREIGN KEY (criancaId) REFERENCES crianca(id) ON DELETE CASCADE;

-- Verify the change
DESCRIBE pagamento;
