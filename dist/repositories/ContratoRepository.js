import connection from '../db.js';
export class ContratoRepository {
    async create(data) {
        const query = `
            INSERT INTO contrato (
                crianca_id, responsavel_id, admin_id, 
                data_inicio, data_fim, 
                valor_anual, valor_mensal, 
                status, observacoes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.criancaId,
            data.responsavelId,
            data.adminId,
            data.dataInicio,
            data.dataFim,
            data.valorAnual,
            data.valorMensal,
            data.status || 'ATIVO',
            data.observacoes || null
        ];
        const [result] = await connection.query(query, params);
        return { id: result.insertId, ...data };
    }
    async findById(id) {
        const query = `
            SELECT 
                id,
                crianca_id as criancaId,
                responsavel_id as responsavelId,
                admin_id as adminId,
                data_inicio as dataInicio,
                data_fim as dataFim,
                valor_anual as valorAnual,
                valor_mensal as valorMensal,
                status,
                data_criacao as dataCriacao,
                data_cancelamento as dataCancelamento,
                motivo_cancelamento as motivoCancelamento,
                contrato_anterior_id as contratoAnteriorId,
                observacoes
            FROM contrato
            WHERE id = ?
        `;
        const [rows] = await connection.query(query, [id]);
        return rows[0] || null;
    }
    async findByCriancaId(criancaId) {
        const query = `
            SELECT 
                id,
                crianca_id as criancaId,
                responsavel_id as responsavelId,
                admin_id as adminId,
                data_inicio as dataInicio,
                data_fim as dataFim,
                valor_anual as valorAnual,
                valor_mensal as valorMensal,
                status,
                data_criacao as dataCriacao,
                data_cancelamento as dataCancelamento,
                motivo_cancelamento as motivoCancelamento,
                contrato_anterior_id as contratoAnteriorId,
                observacoes
            FROM contrato
            WHERE crianca_id = ?
            ORDER BY data_inicio DESC
        `;
        const [rows] = await connection.query(query, [criancaId]);
        return rows;
    }
    async findActiveByCriancaId(criancaId) {
        const query = `
            SELECT 
                id,
                crianca_id as criancaId,
                responsavel_id as responsavelId,
                admin_id as adminId,
                data_inicio as dataInicio,
                data_fim as dataFim,
                valor_anual as valorAnual,
                valor_mensal as valorMensal,
                status,
                data_criacao as dataCriacao,
                data_cancelamento as dataCancelamento,
                motivo_cancelamento as motivoCancelamento,
                contrato_anterior_id as contratoAnteriorId,
                observacoes
            FROM contrato
            WHERE crianca_id = ? AND status = 'ATIVO'
            ORDER BY data_inicio DESC
            LIMIT 1
        `;
        const [rows] = await connection.query(query, [criancaId]);
        return rows[0] || null;
    }
    async updateStatus(id, status, motivoCancelamento) {
        const query = `
            UPDATE contrato 
            SET status = ?,
                data_cancelamento = ${status === 'CANCELADO' ? 'CURDATE()' : 'NULL'},
                motivo_cancelamento = ?
            WHERE id = ?
        `;
        const [result] = await connection.query(query, [status, motivoCancelamento || null, id]);
        return result.affectedRows > 0;
    }
    async findExpiredContracts(adminId) {
        const query = `
            SELECT 
                id,
                crianca_id as criancaId,
                responsavel_id as responsavelId,
                admin_id as adminId,
                data_inicio as dataInicio,
                data_fim as dataFim,
                valor_anual as valorAnual,
                valor_mensal as valorMensal,
                status,
                data_criacao as dataCriacao,
                data_cancelamento as dataCancelamento,
                motivo_cancelamento as motivoCancelamento,
                contrato_anterior_id as contratoAnteriorId,
                observacoes
            FROM contrato
            WHERE admin_id = ? 
              AND status = 'ATIVO' 
              AND data_fim < CURDATE()
            ORDER BY data_fim ASC
        `;
        const [rows] = await connection.query(query, [adminId]);
        return rows;
    }
    async findArchivedContracts(adminId) {
        const query = `
            SELECT 
                id,
                crianca_id as criancaId,
                responsavel_id as responsavelId,
                admin_id as adminId,
                data_inicio as dataInicio,
                data_fim as dataFim,
                valor_anual as valorAnual,
                valor_mensal as valorMensal,
                status,
                data_criacao as dataCriacao,
                data_cancelamento as dataCancelamento,
                motivo_cancelamento as motivoCancelamento,
                contrato_anterior_id as contratoAnteriorId,
                observacoes
            FROM contrato
            WHERE admin_id = ? AND status IN ('ARQUIVADO', 'CANCELADO')
            ORDER BY data_fim DESC
        `;
        const [rows] = await connection.query(query, [adminId]);
        return rows;
    }
}
