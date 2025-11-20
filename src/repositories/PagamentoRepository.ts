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

    async create(data: PagamentoDTO) {
        const query = 'INSERT INTO pagamento (responsavelId, valor, dataPagamento, status) VALUES (?, ?, ?, ?)';
        const [result] = await connection.execute<ResultSetHeader>(query, [
            data.responsavelId,
            data.valor,
            data.dataPagamento || new Date(),
            data.status || 'Pendente'
        ]);
        return { id: result.insertId, ...data };
    }

    async findAll() {
        const query = 'SELECT * FROM pagamento';
        const [rows] = await connection.execute<RowDataPacket[]>(query);
        return rows;
    }

    async findById(id: number) {
        const query = 'SELECT * FROM pagamento WHERE id = ?';
        const [rows] = await connection.execute<RowDataPacket[]>(query, [id]);
        return rows[0];
    }

    async update(id: number, data: Partial<PagamentoDTO>) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        const query = `UPDATE pagamento SET ${fields} WHERE id = ?`;
        await connection.execute(query, [...values, id]);

        return this.findById(id);
    }

    async delete(id: number) {
        const query = 'DELETE FROM pagamento WHERE id = ?';
        await connection.execute(query, [id]);
        return true;
    }
}
