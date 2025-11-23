import connection from '../db.js';
export class ResponsavelRepository {
    async create(data, adminId) {
        console.log('ResponsavelRepository.create - data:', data, 'adminId:', adminId);
        const query = 'INSERT INTO responsavel (nome, cpf, telefone, email, endereco, cep, rua, numero, complemento, bairro, cidade, estado, enderecoId, senha, rg, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [
            data.nome,
            data.cpf,
            data.telefone || null,
            data.email || null,
            data.endereco || null,
            data.cep || null,
            data.rua || null,
            data.numero || null,
            data.complemento || null,
            data.bairro || null,
            data.cidade || null,
            data.estado || null,
            data.enderecoId || null,
            data.senha,
            data.rg || null,
            adminId
        ];
        console.log('ResponsavelRepository.create - params:', params);
        const [result] = await connection.query(query, params);
        return { id: result.insertId, ...data, adminId };
    }
    async findAll(adminId) {
        const query = 'SELECT * FROM responsavel WHERE admin_id = ?';
        const [rows] = await connection.query(query, [adminId]);
        return rows;
    }
    async findById(id, adminId) {
        const query = 'SELECT * FROM responsavel WHERE id = ? AND admin_id = ?';
        const [rows] = await connection.query(query, [id, adminId]);
        return rows[0];
    }
    async update(id, data, adminId) {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);
        if (fields.length === 0)
            return this.findById(id, adminId);
        const query = `UPDATE responsavel SET ${fields} WHERE id = ? AND admin_id = ?`;
        await connection.query(query, [...values, id, adminId]);
        return this.findById(id, adminId);
    }
    async delete(id, adminId) {
        console.log('ResponsavelRepository.delete - Deleting ID:', id, 'adminId:', adminId);
        const query = 'DELETE FROM responsavel WHERE id = ? AND admin_id = ?';
        const [result] = await connection.query(query, [id, adminId]);
        console.log('ResponsavelRepository.delete - Rows affected:', result.affectedRows);
        return result.affectedRows > 0;
    }
    async findByCpf(cpf, adminId) {
        const query = 'SELECT * FROM responsavel WHERE cpf = ? AND admin_id = ?';
        const [rows] = await connection.query(query, [cpf, adminId]);
        return rows[0];
    }
    async findByEmail(email, adminId) {
        const query = 'SELECT * FROM responsavel WHERE email = ? AND admin_id = ?';
        const [rows] = await connection.query(query, [email, adminId]);
        return rows[0];
    }
}
