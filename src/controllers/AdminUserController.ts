import { Request, Response } from 'express';
import connection from '../db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';

export class AdminUserController {
    async listAdmins(req: Request, res: Response) {
        console.log('AdminUserController.listAdmins called'); // DEBUG
        try {
            console.log('Fetching admins from DB...');
            const [admins] = await connection.query<RowDataPacket[]>('SELECT id, nome, email, role, active, cpf_cnpj, endereco FROM admin');
            console.log(`Fetched ${admins.length} admins`);

            console.log('Fetching responsaveis from DB...');
            const [responsaveis] = await connection.query<RowDataPacket[]>('SELECT id, nome, email, "cliente" as role, active FROM responsavel');
            console.log(`Fetched ${responsaveis.length} responsaveis`);

            const adminUsers = admins.map(a => ({ ...a, type: 'admin' }));
            const clientUsers = responsaveis.map(r => ({ ...r, type: 'responsavel' }));

            res.json([...adminUsers, ...clientUsers]);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({ error: 'Erro ao listar usuários.' });
        }
    }

    async createAdmin(req: Request, res: Response) {
        const { nome, email, password, role } = req.body;

        if (role === 'master') {
            return res.status(403).json({ error: 'Não é permitido criar usuários Master.' });
        }

        // Only creates admins for now. Clients are created via registration or Admin dashboard (future).
        // If role is 'cliente', we might want to create in responsavel table, but for now let's stick to admin table for 'admin' role.

        try {
            // Check if email exists in admin
            const [existing] = await connection.query<RowDataPacket[]>('SELECT id FROM admin WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Email já cadastrado.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            // Both tables use 'senha' column
            const query = 'INSERT INTO admin (nome, email, senha, role) VALUES (?, ?, ?, ?)';
            const [result] = await connection.query<ResultSetHeader>(query, [nome, email, hashedPassword, role || 'admin']);

            res.status(201).json({ id: result.insertId, nome, email, role: role || 'admin', type: 'admin' });
        } catch (error) {
            console.error('Erro ao criar admin:', error);
            res.status(500).json({ error: 'Erro ao criar usuário.' });
        }
    }

    async updateAdmin(req: Request, res: Response) {
        const { id } = req.params;
        const { nome, email, password, role, cpf_cnpj, endereco } = req.body;
        const type = req.query.type as string; // 'admin' or 'responsavel'

        if (role === 'master') {
            return res.status(403).json({ error: 'Não é permitido atribuir o perfil Master.' });
        }

        try {
            const table = type === 'responsavel' ? 'responsavel' : 'admin';

            // Check if user exists
            const [currentUser] = await connection.query<RowDataPacket[]>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
            if (currentUser.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            if (table === 'admin' && currentUser[0].role === 'master') {
                // Prevent editing Master role/email if needed, but allow password/name
            }

            let query = `UPDATE ${table} SET nome = ?, email = ?`;
            let params = [nome, email];

            if (table === 'admin') {
                // Only update role if explicitly provided
                if (role !== undefined) {
                    query += ', role = ?';
                    params.push(role);
                }

                // Add cpf_cnpj and endereco for admin table
                if (cpf_cnpj !== undefined) {
                    query += ', cpf_cnpj = ?';
                    params.push(cpf_cnpj);
                }
                if (endereco !== undefined) {
                    query += ', endereco = ?';
                    params.push(endereco);
                }
            }
            // Responsavel doesn't have role column update (always cliente)

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                // Both tables use 'senha' column based on error 'Unknown column password'
                query += ', senha = ?';
                params.push(hashedPassword);
            }

            query += ' WHERE id = ?';
            params.push(id);

            await connection.query(query, params);

            res.json({ message: 'Usuário atualizado com sucesso.' });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ error: 'Erro ao atualizar usuário.' });
        }
    }

    async deleteAdmin(req: Request, res: Response) {
        const { id } = req.params;
        const type = req.query.type as string;

        try {
            const table = type === 'responsavel' ? 'responsavel' : 'admin';

            const [user] = await connection.query<RowDataPacket[]>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
            if (user.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            if (table === 'admin' && user[0].role === 'master') {
                return res.status(403).json({ error: 'Não é permitido excluir o usuário Master.' });
            }

            if (table === 'responsavel') {
                return res.status(403).json({ error: 'Não é permitido excluir usuários clientes. Apenas inativação é permitida.' });
            }

            await connection.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
            res.json({ message: 'Usuário excluído com sucesso.' });
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            res.status(500).json({ error: 'Erro ao excluir usuário.' });
        }
    }

    async toggleActive(req: Request, res: Response) {
        const { id } = req.params;
        const type = req.query.type as string;

        try {
            const table = type === 'responsavel' ? 'responsavel' : 'admin';

            // Check if user exists
            const [user] = await connection.query<RowDataPacket[]>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
            if (user.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            // Prevent deactivating Master
            if (table === 'admin' && user[0].role === 'master') {
                return res.status(403).json({ error: 'Não é permitido desativar o usuário Master.' });
            }

            // Toggle active status
            const newStatus = !user[0].active;
            await connection.query(`UPDATE ${table} SET active = ? WHERE id = ?`, [newStatus, id]);

            res.json({ message: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso.`, active: newStatus });
        } catch (error) {
            console.error('Erro ao alternar status do usuário:', error);
            res.status(500).json({ error: 'Erro ao alternar status do usuário.' });
        }
    }
}
