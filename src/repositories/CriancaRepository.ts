
import connection from '../db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface CriancaDTO {
    nome: string;
    dataNascimento?: string;
    escola?: string;
    escolaId?: number;
    horario?: string;
    horarioEntrada?: string;
    horarioSaida?: string;
    tipoTransporte?: 'ida_volta' | 'so_ida' | 'so_volta';
    responsavelId: number;
    dataInicioContrato?: Date | string;
    valorContratoAnual?: number;
}

export class CriancaRepository {

    async create(data: CriancaDTO, adminId: number) {
        // Verify if responsavel belongs to admin
        const [respRows] = await connection.query<RowDataPacket[]>('SELECT * FROM responsavel WHERE id = ? AND admin_id = ?', [data.responsavelId, adminId]);
        if (respRows.length === 0) {
            throw new Error("Responsável não encontrado ou não pertence a este administrador.");
        }

        const query = 'INSERT INTO crianca (nome, data_nascimento, escola_id, escola, horario, horario_entrada, horario_saida, tipo_transporte, responsavel_id, data_inicio_contrato, valor_contrato_anual) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [
            data.nome,
            data.dataNascimento || null,
            data.escolaId || null,
            data.escola || '', // Keep for backward compatibility if needed, or empty
            data.horario || null,
            data.horarioEntrada || null,
            data.horarioSaida || null,
            data.tipoTransporte || 'ida_volta',
            data.responsavelId,
            data.dataInicioContrato || null,
            data.valorContratoAnual || 0
        ];
        console.log('CriancaRepository.create params:', params);

        try {
            const [result] = await connection.query<ResultSetHeader>(query, params);
            return { id: result.insertId, ...data };
        } catch (error: any) {
            console.error('CRITICAL SQL ERROR:', error);
            throw error;
        }
    }

    async findAll(adminId: number) {
        const query = `
            SELECT c.*, e.nome as nome_escola 
            FROM crianca c
            JOIN responsavel r ON c.responsavel_id = r.id
            LEFT JOIN escola e ON c.escola_id = e.id
            WHERE r.admin_id = ?
        `;
        const [rows] = await connection.query<RowDataPacket[]>(query, [adminId]);
        return rows;
    }

    async findByResponsavelId(responsavelId: number, adminId: number) {
        const query = `
            SELECT c.*, e.nome as nome_escola 
            FROM crianca c
            JOIN responsavel r ON c.responsavel_id = r.id
            LEFT JOIN escola e ON c.escola_id = e.id
            WHERE c.responsavel_id = ? AND r.admin_id = ?
        `;
        const [rows] = await connection.query<RowDataPacket[]>(query, [responsavelId, adminId]);
        return rows;
    }

    async findById(id: number, adminId: number) {
        const query = `
            SELECT c.*, e.nome as nome_escola 
            FROM crianca c
            JOIN responsavel r ON c.responsavel_id = r.id
            LEFT JOIN escola e ON c.escola_id = e.id
            WHERE c.id = ? AND r.admin_id = ?
        `;
        const [rows] = await connection.query<RowDataPacket[]>(query, [id, adminId]);
        return rows[0];
    }

    async update(id: number, data: Partial<CriancaDTO>, adminId: number) {
        // First check if the child exists and belongs to admin
        const existing = await this.findById(id, adminId);
        if (!existing) return null;

        // Map camelCase to snake_case for database columns
        const columnMap: Record<string, string> = {
            'nome': 'nome',
            'dataNascimento': 'data_nascimento',
            'escolaId': 'escola_id',
            'escola': 'escola',
            'horario': 'horario',
            'horarioEntrada': 'horario_entrada',
            'horarioSaida': 'horario_saida',
            'tipoTransporte': 'tipo_transporte',
            'responsavelId': 'responsavel_id',
            'dataInicioContrato': 'data_inicio_contrato',
            'valorContratoAnual': 'valor_contrato_anual'
        };

        const fields: string[] = [];
        const values: any[] = [];

        Object.keys(data).forEach(key => {
            const dbColumn = columnMap[key] || key;
            fields.push(`${dbColumn} = ?`);
            values.push((data as any)[key]);
        });

        if (fields.length === 0) return existing;

        const query = `UPDATE crianca SET ${fields.join(', ')} WHERE id = ?`;
        await connection.query(query, [...values, id]);

        // Return the updated record
        return this.findById(id, adminId);
    }

    async delete(id: number, adminId: number) {
        // First check if the child exists and belongs to admin
        const existing = await this.findById(id, adminId);
        if (!existing) return false;

        const query = 'DELETE FROM crianca WHERE id = ?';
        await connection.query(query, [id]);
        return true;
    }
}
