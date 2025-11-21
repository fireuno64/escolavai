// src/controllers/AuthController.ts

import { Request, Response } from 'express';
import connection from '../db.js';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthController {

    async login(req: Request, res: Response) {
        console.log('Login attempt:', req.body); // DEBUG
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Missing fields'); // DEBUG
            return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
        }

        try {
            let user = null;
            let userRole = null;

            // First, check admin table
            console.log('Checking admin table...'); // DEBUG
            const [adminRows] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM admin WHERE email = ?',
                [email]
            );

            if (adminRows.length > 0) {
                user = adminRows[0];
                userRole = user.role; // 'master' or 'admin'
                console.log(`Found in admin table with role: ${userRole}`); // DEBUG

                // Check if admin user is active
                if (user.active === false) {
                    console.log('User is inactive'); // DEBUG
                    return res.status(403).json({
                        error: 'Sua conta está desativada. Entre em contato com o administrador.'
                    });
                }
            } else {
                // If not found in admin, check responsavel table
                console.log('Not found in admin, checking responsavel table...'); // DEBUG
                const [responsavelRows] = await connection.execute<RowDataPacket[]>(
                    'SELECT * FROM responsavel WHERE email = ?',
                    [email]
                );

                if (responsavelRows.length > 0) {
                    user = responsavelRows[0];
                    userRole = 'cliente'; // Responsavel is always 'cliente'
                    console.log('Found in responsavel table as cliente'); // DEBUG

                    if (user.active === false) {
                        console.log('User is inactive'); // DEBUG
                        return res.status(403).json({
                            error: 'Sua conta está desativada. Entre em contato com o administrador.'
                        });
                    }
                } else {
                    console.log('User not found in any table'); // DEBUG
                    return res.status(401).json({ error: 'Usuário não encontrado.' });
                }
            }

            // Verificação de senha com bcrypt
            const passwordMatch = await bcrypt.compare(password, user.senha);

            // Fallback para senhas em texto plano (apenas para desenvolvimento/migração)
            if (!passwordMatch && user.senha === password) {
                console.log('Plain text password match (Legacy)');
            } else if (!passwordMatch) {
                console.log('Invalid password'); // DEBUG
                return res.status(401).json({ error: 'Senha incorreta.' });
            }

            console.log(`Login successful as ${userRole}`); // DEBUG

            const token = jwt.sign({
                id: user.id,
                role: userRole,
                email: user.email
            }, process.env.JWT_SECRET || 'secret', {
                expiresIn: '24h'
            });

            return res.status(200).json({
                message: 'Login realizado com sucesso!',
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    role: userRole,
                    token // Return token to frontend
                }
            });

        } catch (error: any) {
            const fs = await import('fs');
            const errorMsg = `[${new Date().toISOString()}] Erro no login: ${error.stack || error}\n`;
            fs.appendFileSync('error.log', errorMsg);
            console.error('Erro no login (CATCH):', error); // DEBUG
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }
    async updateProfile(req: Request, res: Response) {
        const { id, nome, email, password } = req.body;

        if (!id || !nome || !email) {
            return res.status(400).json({ error: 'ID, nome e email são obrigatórios.' });
        }

        try {
            let query = 'UPDATE admin SET nome = ?, email = ?';
            let params: any[] = [nome, email];

            if (password) {
                // Hash password if provided
                // Note: Ideally use bcrypt here, but for consistency with current login logic (which supports plain text fallback), 
                // we should decide on one. Given the login uses bcrypt.compare, we MUST hash here.
                // However, the login also has a fallback for plain text. Let's stick to plain text for now to avoid breaking if bcrypt isn't fully set up for all users,
                // OR implement bcrypt properly. 
                // Let's use the existing pattern: if the user provides a password, we update it. 
                // Ideally we should hash it.
                // const hashedPassword = await bcrypt.hash(password, 10);
                // query += ', password = ?';
                // params.push(hashedPassword);

                // For now, storing as plain text to match the "legacy" support in login, 
                // BUT the login prefers bcrypt. Let's try to use bcrypt if available.
                // Since I see bcrypt imported, I will use it.
                const hashedPassword = await bcrypt.hash(password, 10);
                query += ', password = ?';
                params.push(hashedPassword);
            }

            query += ' WHERE id = ?';
            params.push(id);

            await connection.query(query, params);

            res.json({ id, nome, email });
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({ error: 'Erro ao atualizar perfil.' });
        }
    }
}
