-- Script de migração de dados existentes para a tabela contrato
-- Este script deve ser executado APÓS a criação da tabela contrato

-- Inserir contratos existentes baseados nos dados da tabela crianca
INSERT INTO contrato (
    crianca_id,
    responsavel_id,
    admin_id,
    data_inicio,
    data_fim,
    valor_anual,
    valor_mensal,
    status,
    data_criacao
)
SELECT 
    c.id AS crianca_id,
    c.responsavel_id,
    r.admin_id,
    c.data_inicio_contrato AS data_inicio,
    DATE_ADD(c.data_inicio_contrato, INTERVAL 1 YEAR) AS data_fim,
    c.valor_contrato_anual AS valor_anual,
    ROUND(c.valor_contrato_anual / 12, 2) AS valor_mensal,
    CASE 
        WHEN DATE_ADD(c.data_inicio_contrato, INTERVAL 1 YEAR) < CURDATE() THEN 'VENCIDO'
        ELSE 'ATIVO'
    END AS status,
    NOW() AS data_criacao
FROM crianca c
INNER JOIN responsavel r ON c.responsavel_id = r.id
WHERE c.data_inicio_contrato IS NOT NULL 
  AND c.valor_contrato_anual IS NOT NULL
  AND c.valor_contrato_anual > 0;

-- Associar pagamentos existentes aos contratos criados
UPDATE pagamento p
INNER JOIN crianca c ON p.criancaId = c.id
INNER JOIN contrato ct ON ct.crianca_id = c.id AND ct.status IN ('ATIVO', 'VENCIDO')
SET p.contrato_id = ct.id
WHERE p.contrato_id IS NULL;

-- Verificar resultados da migração
SELECT 
    'Contratos criados' AS descricao,
    COUNT(*) AS total
FROM contrato
UNION ALL
SELECT 
    'Pagamentos associados' AS descricao,
    COUNT(*) AS total
FROM pagamento
WHERE contrato_id IS NOT NULL;
