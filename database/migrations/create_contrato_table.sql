-- Criar tabela de contratos
CREATE TABLE IF NOT EXISTS contrato (
    id INT PRIMARY KEY AUTO_INCREMENT,
    crianca_id INT NOT NULL,
    responsavel_id INT NOT NULL,
    admin_id INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    valor_anual DECIMAL(10,2) NOT NULL,
    valor_mensal DECIMAL(10,2) NOT NULL,
    status ENUM('ATIVO', 'VENCIDO', 'CANCELADO', 'ARQUIVADO') DEFAULT 'ATIVO',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_cancelamento DATE NULL,
    motivo_cancelamento TEXT NULL,
    contrato_anterior_id INT NULL,
    observacoes TEXT NULL,
    FOREIGN KEY (crianca_id) REFERENCES crianca(id) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id) REFERENCES responsavel(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admin(id),
    FOREIGN KEY (contrato_anterior_id) REFERENCES contrato(id) ON DELETE SET NULL,
    INDEX idx_crianca (crianca_id),
    INDEX idx_status (status),
    INDEX idx_datas (data_inicio, data_fim)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar coluna contrato_id na tabela pagamento (se não existir)
-- ALTER TABLE pagamento ADD COLUMN contrato_id INT NULL AFTER criancaId;
-- ALTER TABLE pagamento ADD CONSTRAINT fk_pagamento_contrato FOREIGN KEY (contrato_id) REFERENCES contrato(id) ON DELETE CASCADE;
-- (Comentado pois a coluna já foi criada em execução anterior)

