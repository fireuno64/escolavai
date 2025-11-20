
import connection from '../db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface ResponsavelDTO {
    nome: string;
    cpf: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    enderecoId?: number;
    senha: string;
    valor_contrato?: number;
    data_inicio_contrato?: Date | string;
    rg?: string;
}

export class ResponsavelRepository {

    async create(data: ResponsavelDTO) {
        console.log('ResponsavelRepository.create - data:', data);
        const query = 'INSERT INTO responsavel (nome, cpf, telefone, email, endereco, enderecoId, senha, valor_contrato, data_inicio_contrato, rg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [
            data.nome,
            data.cpf,
            data.telefone || null,
            data.email || null,
            data.endereco || null,
            data.enderecoId || null,
            data.senha,
            data.valor_contrato || 0,
            data.data_inicio_contrato || null,
            data.rg || null
        ];
        console.log('ResponsavelRepository.create - params:', params);
        const [result] = await connection.query<ResultSetHeader>(query, params);
        return { id: result.insertId, ...data };
    }

    async findAll() {
        const query = 'SELECT * FROM responsavel';
        const [rows] = await connection.query<RowDataPacket[]>(query);
        return rows;
    }

    async findById(id: number) {
        const query = 'SELECT * FROM responsavel WHERE id = ?';
        const [rows] = await connection.query<RowDataPacket[]>(query, [id]);
        return rows[0];
    }

    async update(id: number, data: Partial<ResponsavelDTO>) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        if (fields.length === 0) return this.findById(id);

        const query = `UPDATE responsavel SET ${fields} WHERE id = ?`;
        await connection.query(query, [...values, id]);

        return this.findById(id);
    }

    async delete(id: number) {
        console.log('ResponsavelRepository.delete - Deleting ID:', id);
        const query = 'DELETE FROM responsavel WHERE id = ?';
        const [result] = await connection.query<ResultSetHeader>(query, [id]);
        console.log('ResponsavelRepository.delete - Rows affected:', result.affectedRows);
        return true;
    }

    async findByCpf(cpf: string) {
        const query = 'SELECT * FROM responsavel WHERE cpf = ?';
        const [rows] = await connection.query<RowDataPacket[]>(query, [cpf]);
        return rows[0];
    }
}