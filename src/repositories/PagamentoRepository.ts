// src/repositories/PagamentoRepository.ts

import connection from '../db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface PagamentoDTO {
    responsavelId: number;
    valor: number;
    dataPagamento?: Date;
    status?: string;
}

export class PagamentoRepository {

    async create(data: PagamentoDTO, adminId: number) {
        const query = 'INSERT INTO pagamento (responsavelId, valor, dataPagamento, status, admin_id) VALUES (?, ?, ?, ?, ?)';
        const [result] = await connection.execute<ResultSetHeader>(query, [
            data.responsavelId,
            data.valor,
            data.dataPagamento || new Date(),
            data.status || 'Pendente',
            adminId
        ]);
        return { id: result.insertId, ...data, adminId };
    }

    async findAll(adminId: number) {
        const query = 'SELECT * FROM pagamento WHERE admin_id = ?';
        const [rows] = await connection.execute<RowDataPacket[]>(query, [adminId]);
        return rows;
    }

    async findById(id: number, adminId: number) {
        const query = 'SELECT * FROM pagamento WHERE id = ? AND admin_id = ?';
        const [rows] = await connection.execute<RowDataPacket[]>(query, [id, adminId]);
        return rows[0];
    }

    async findByResponsavel(responsavelId: number) {
        const query = 'SELECT * FROM pagamento WHERE responsavelId = ? ORDER BY dataPagamento DESC';
        const [rows] = await connection.execute<RowDataPacket[]>(query, [responsavelId]);
        return rows;
    }

    async update(id: number, data: Partial<PagamentoDTO>, adminId: number) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        if (fields.length === 0) return this.findById(id, adminId);

        const query = `UPDATE pagamento SET ${fields} WHERE id = ? AND admin_id = ?`;
        await connection.execute(query, [...values, id, adminId]);

        return this.findById(id, adminId);
    }

    async delete(id: number, adminId: number) {
        const query = 'DELETE FROM pagamento WHERE id = ? AND admin_id = ?';
        const [result] = await connection.execute<ResultSetHeader>(query, [id, adminId]);
        return result.affectedRows > 0;
    }
}
