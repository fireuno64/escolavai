import connection from '../db.js';
export class CriancaRepository {
    async create(data, adminId) {
        // Verify if responsavel belongs to admin
        const [respRows] = await connection.query('SELECT * FROM responsavel WHERE id = ? AND admin_id = ?', [data.responsavelId, adminId]);
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
            const [result] = await connection.query(query, params);
            return { id: result.insertId, ...data };
        }
        catch (error) {
            console.error('CRITICAL SQL ERROR:', error);
            throw error;
        }
    }
    async findAll(adminId) {
        const query = `
            SELECT c.*, e.nome as nome_escola 
            FROM crianca c
            JOIN responsavel r ON c.responsavel_id = r.id
            LEFT JOIN escola e ON c.escola_id = e.id
            WHERE r.admin_id = ?
        `;
        const [rows] = await connection.query(query, [adminId]);
        return rows;
    }
    async findByResponsavelId(responsavelId, adminId) {
        const query = `
            SELECT c.*, e.nome as nome_escola 
            FROM crianca c
            JOIN responsavel r ON c.responsavel_id = r.id
            LEFT JOIN escola e ON c.escola_id = e.id
            WHERE c.responsavel_id = ? AND r.admin_id = ?
        `;
        const [rows] = await connection.query(query, [responsavelId, adminId]);
        return rows;
    }
    async findById(id, adminId) {
        const query = `
            SELECT c.*, e.nome as nome_escola 
            FROM crianca c
            JOIN responsavel r ON c.responsavel_id = r.id
            LEFT JOIN escola e ON c.escola_id = e.id
            WHERE c.id = ? AND r.admin_id = ?
        `;
        const [rows] = await connection.query(query, [id, adminId]);
        return rows[0];
    }
    async update(id, data, adminId) {
        // First check if the child exists and belongs to admin
        const existing = await this.findById(id, adminId);
        if (!existing)
            return null;
        // Map camelCase to snake_case for database columns
        const columnMap = {
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
        const fields = [];
        const values = [];
        Object.keys(data).forEach(key => {
            const dbColumn = columnMap[key] || key;
            fields.push(`${dbColumn} = ?`);
            values.push(data[key]);
        });
        if (fields.length === 0)
            return existing;
        const query = `UPDATE crianca SET ${fields.join(', ')} WHERE id = ?`;
        await connection.query(query, [...values, id]);
        // Return the updated record
        return this.findById(id, adminId);
    }
    async delete(id, adminId) {
        // First check if the child exists and belongs to admin
        const existing = await this.findById(id, adminId);
        if (!existing)
            return false;
        const query = 'DELETE FROM crianca WHERE id = ?';
        await connection.query(query, [id]);
        return true;
    }
}
