import connection from '../db.js';
export class EscolaRepository {
    async create(data) {
        const query = 'INSERT INTO escola (nome, endereco, cep, rua, numero, complemento, bairro, cidade, estado, contato, telefone, email, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [
            data.nome,
            data.endereco || null,
            data.cep || null,
            data.rua || null,
            data.numero || null,
            data.complemento || null,
            data.bairro || null,
            data.cidade || null,
            data.estado || null,
            data.contato || null,
            data.telefone || null,
            data.email || null,
            data.adminId
        ];
        const [result] = await connection.query(query, params);
        return { id: result.insertId, ...data };
    }
    async findAll(adminId) {
        const query = 'SELECT * FROM escola WHERE admin_id = ?';
        const [rows] = await connection.query(query, [adminId]);
        return rows;
    }
    async findById(id, adminId) {
        const query = 'SELECT * FROM escola WHERE id = ? AND admin_id = ?';
        const [rows] = await connection.query(query, [id, adminId]);
        return rows[0];
    }
    async update(id, data, adminId) {
        const existing = await this.findById(id, adminId);
        if (!existing)
            return null;
        const fields = [];
        const values = [];
        if (data.nome !== undefined) {
            fields.push('nome = ?');
            values.push(data.nome);
        }
        if (data.endereco !== undefined) {
            fields.push('endereco = ?');
            values.push(data.endereco);
        }
        if (data.cep !== undefined) {
            fields.push('cep = ?');
            values.push(data.cep);
        }
        if (data.rua !== undefined) {
            fields.push('rua = ?');
            values.push(data.rua);
        }
        if (data.numero !== undefined) {
            fields.push('numero = ?');
            values.push(data.numero);
        }
        if (data.complemento !== undefined) {
            fields.push('complemento = ?');
            values.push(data.complemento);
        }
        if (data.bairro !== undefined) {
            fields.push('bairro = ?');
            values.push(data.bairro);
        }
        if (data.cidade !== undefined) {
            fields.push('cidade = ?');
            values.push(data.cidade);
        }
        if (data.estado !== undefined) {
            fields.push('estado = ?');
            values.push(data.estado);
        }
        if (data.contato !== undefined) {
            fields.push('contato = ?');
            values.push(data.contato);
        }
        if (data.telefone !== undefined) {
            fields.push('telefone = ?');
            values.push(data.telefone);
        }
        if (data.email !== undefined) {
            fields.push('email = ?');
            values.push(data.email);
        }
        if (fields.length === 0)
            return existing;
        const query = `UPDATE escola SET ${fields.join(', ')} WHERE id = ? AND admin_id = ?`;
        await connection.query(query, [...values, id, adminId]);
        return this.findById(id, adminId);
    }
    async delete(id, adminId) {
        // Check if any children are registered to this school
        const checkQuery = 'SELECT COUNT(*) as count FROM crianca WHERE escola_id = ?';
        const [checkResult] = await connection.query(checkQuery, [id]);
        if (checkResult[0].count > 0) {
            throw new Error('Não é possível excluir esta escola pois existem crianças cadastradas nela.');
        }
        const query = 'DELETE FROM escola WHERE id = ? AND admin_id = ?';
        const [result] = await connection.query(query, [id, adminId]);
        return result.affectedRows > 0;
    }
}
