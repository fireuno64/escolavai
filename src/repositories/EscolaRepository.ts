import connection from '../db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface EscolaDTO {
    id?: number;
    nome: string;
    endereco?: string;
    contato?: string;
    telefone?: string;
    email?: string;
    adminId: number;
}

export class EscolaRepository {
    async create(data: EscolaDTO) {
        const query = 'INSERT INTO escola (nome, endereco, contato, telefone, email, admin_id) VALUES (?, ?, ?, ?, ?, ?)';
        const params = [data.nome, data.endereco, data.contato, data.telefone, data.email, data.adminId];
        const [result] = await connection.query<ResultSetHeader>(query, params);
        return { id: result.insertId, ...data };
    }

    async findAll(adminId: number) {
        const query = 'SELECT * FROM escola WHERE admin_id = ?';
        const [rows] = await connection.query<RowDataPacket[]>(query, [adminId]);
        return rows;
    }

    async findById(id: number, adminId: number) {
        const query = 'SELECT * FROM escola WHERE id = ? AND admin_id = ?';
        const [rows] = await connection.query<RowDataPacket[]>(query, [id, adminId]);
        return rows[0];
    }

    async update(id: number, data: Partial<EscolaDTO>, adminId: number) {
        const existing = await this.findById(id, adminId);
        if (!existing) return null;

        const fields: string[] = [];
        const values: any[] = [];

        if (data.nome) { fields.push('nome = ?'); values.push(data.nome); }
        if (data.endereco) { fields.push('endereco = ?'); values.push(data.endereco); }
        if (data.contato) { fields.push('contato = ?'); values.push(data.contato); }
        if (data.telefone) { fields.push('telefone = ?'); values.push(data.telefone); }
        if (data.email) { fields.push('email = ?'); values.push(data.email); }

        if (fields.length === 0) return existing;

        const query = `UPDATE escola SET ${fields.join(', ')} WHERE id = ? AND admin_id = ?`;
        await connection.query(query, [...values, id, adminId]);
        return this.findById(id, adminId);
    }

    async delete(id: number, adminId: number) {
        // Check if any children are registered to this school
        const checkQuery = 'SELECT COUNT(*) as count FROM crianca WHERE escola_id = ?';
        const [checkResult] = await connection.query<RowDataPacket[]>(checkQuery, [id]);

        if (checkResult[0].count > 0) {
            throw new Error('Não é possível excluir esta escola pois existem crianças cadastradas nela.');
        }

        const query = 'DELETE FROM escola WHERE id = ? AND admin_id = ?';
        const [result] = await connection.query<ResultSetHeader>(query, [id, adminId]);
        return result.affectedRows > 0;
    }
}
