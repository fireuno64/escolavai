
import connection from '../db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface ContratoDTO {
    id?: number;
    criancaId: number;
    responsavelId: number;
    adminId: number;
    dataInicio: string | Date;
    dataFim: string | Date;
    valorAnual: number;
    valorMensal: number;
    status?: 'ATIVO' | 'VENCIDO' | 'CANCELADO' | 'ARQUIVADO';
    dataCriacao?: Date;
    dataCancelamento?: string | Date | null;
    motivoCancelamento?: string | null;
    contratoAnteriorId?: number | null;
    observacoes?: string | null;
}

export class ContratoRepository {

    async create(data: ContratoDTO): Promise<ContratoDTO> {
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

        const [result] = await connection.query<ResultSetHeader>(query, params);
        return { id: result.insertId, ...data };
    }

    async findById(id: number): Promise<ContratoDTO | null> {
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

        const [rows] = await connection.query<RowDataPacket[]>(query, [id]);
        return rows[0] as ContratoDTO || null;
    }

    async findByCriancaId(criancaId: number): Promise<ContratoDTO[]> {
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

        const [rows] = await connection.query<RowDataPacket[]>(query, [criancaId]);
        return rows as ContratoDTO[];
    }

    async findActiveByCriancaId(criancaId: number): Promise<ContratoDTO | null> {
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

        const [rows] = await connection.query<RowDataPacket[]>(query, [criancaId]);
        return rows[0] as ContratoDTO || null;
    }

    async updateStatus(
        id: number,
        status: 'ATIVO' | 'VENCIDO' | 'CANCELADO' | 'ARQUIVADO',
        motivoCancelamento?: string
    ): Promise<boolean> {
        const query = `
            UPDATE contrato 
            SET status = ?,
                data_cancelamento = ${status === 'CANCELADO' ? 'CURDATE()' : 'NULL'},
                motivo_cancelamento = ?
            WHERE id = ?
        `;

        const [result] = await connection.query<ResultSetHeader>(
            query,
            [status, motivoCancelamento || null, id]
        );

        return result.affectedRows > 0;
    }

    async findExpiredContracts(adminId: number): Promise<ContratoDTO[]> {
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

        const [rows] = await connection.query<RowDataPacket[]>(query, [adminId]);
        return rows as ContratoDTO[];
    }

    async findArchivedContracts(adminId: number): Promise<ContratoDTO[]> {
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

        const [rows] = await connection.query<RowDataPacket[]>(query, [adminId]);
        return rows as ContratoDTO[];
    }
}
