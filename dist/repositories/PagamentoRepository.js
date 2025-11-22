// src/repositories/PagamentoRepository.ts
import connection from '../db.js';
export class PagamentoRepository {
    async create(data, adminId) {
        const query = 'INSERT INTO pagamento (responsavelId, valor, dataPagamento, status, admin_id) VALUES (?, ?, ?, ?, ?)';
        const [result] = await connection.execute(query, [
            data.responsavelId,
            data.valor,
            data.dataPagamento || new Date(),
            data.status || 'Pendente',
            adminId
        ]);
        return { id: result.insertId, ...data, adminId };
    }
    async findAll(adminId) {
        const query = `
            SELECT 
                p.*,
                c.nome as crianca_nome
            FROM pagamento p
            LEFT JOIN crianca c ON p.criancaId = c.id
            WHERE p.admin_id = ?
        `;
        const [rows] = await connection.execute(query, [adminId]);
        return rows;
    }
    async findById(id, adminId) {
        const query = 'SELECT * FROM pagamento WHERE id = ? AND admin_id = ?';
        const [rows] = await connection.execute(query, [id, adminId]);
        return rows[0];
    }
    async findByResponsavel(responsavelId) {
        const query = 'SELECT * FROM pagamento WHERE responsavelId = ? ORDER BY dataPagamento DESC';
        const [rows] = await connection.execute(query, [responsavelId]);
        return rows;
    }
    async update(id, data, adminId) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);
        if (fields.length === 0)
            return this.findById(id, adminId);
        const query = `UPDATE pagamento SET ${fields} WHERE id = ? AND admin_id = ?`;
        await connection.execute(query, [...values, id, adminId]);
        return this.findById(id, adminId);
    }
    async delete(id, adminId) {
        const query = 'DELETE FROM pagamento WHERE id = ? AND admin_id = ?';
        const [result] = await connection.execute(query, [id, adminId]);
        return result.affectedRows > 0;
    }
}
