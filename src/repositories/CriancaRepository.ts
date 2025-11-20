
import connection from '../db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface CriancaDTO {
    nome: string;
    escola: string;
    horario?: string;
    horarioEntrada?: string;
    horarioSaida?: string;
    responsavelId: number;
}

export class CriancaRepository {

    async create(data: CriancaDTO) {
        const query = 'INSERT INTO crianca (nome, escola, horario, horario_entrada, horario_saida, responsavel_id) VALUES (?, ?, ?, ?, ?, ?)';
        const params = [
            data.nome,
            data.escola,
            data.horario || null,
            data.horarioEntrada || null,
            data.horarioSaida || null,
            data.responsavelId
        ];
        console.log('CriancaRepository.create params:', params);

        try {
            // Verify responsavel exists using shared connection
            const [respRows] = await connection.query<RowDataPacket[]>('SELECT * FROM responsavel WHERE id = ?', [data.responsavelId]);
            console.log('Responsavel check (shared conn):', respRows.length > 0 ? 'Found' : 'Not Found');

            const [result] = await connection.query<ResultSetHeader>(query, params);
            return { id: result.insertId, ...data };
        } catch (error: any) {
            console.error('CRITICAL SQL ERROR:', error);
            throw error;
        }
    }

    async findAll() {
        const query = 'SELECT * FROM crianca';
        const [rows] = await connection.query<RowDataPacket[]>(query);
        return rows;
    }

    async findByResponsavelId(responsavelId: number) {
        const query = 'SELECT * FROM crianca WHERE responsavel_id = ?';
        const [rows] = await connection.query<RowDataPacket[]>(query, [responsavelId]);
        return rows;
    }

    async findById(id: number) {
        const query = 'SELECT * FROM crianca WHERE id = ?';
        const [rows] = await connection.query<RowDataPacket[]>(query, [id]);
        return rows[0];
    }

    async update(id: number, data: Partial<CriancaDTO>) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        if (fields.length === 0) return this.findById(id);

        const query = `UPDATE crianca SET ${fields} WHERE id = ?`;
        await connection.query(query, [...values, id]);

        // Return the updated record
        const updated = await this.findById(id);
        return updated;
    }

    async delete(id: number) {
        const query = 'DELETE FROM crianca WHERE id = ?';
        await connection.query(query, [id]);
        return true;
    }
}
