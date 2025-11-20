// src/controllers/AuthController.ts

import { Request, Response } from 'express';
import connection from '../db.js';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';

export class AuthController {

    async login(req: Request, res: Response) {
        console.log('Login attempt:', req.body); // DEBUG
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            console.log('Missing fields'); // DEBUG
            return res.status(400).json({ error: 'Email, senha e tipo de usuário são obrigatórios.' });
        }

        try {
            let user = null;
            console.log(`Checking role: ${role}`); // DEBUG

            if (role === 'admin') {
                const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM admin WHERE email = ?', [email]);
                console.log('Admin query result:', rows); // DEBUG
                if (rows.length > 0) {
                    user = rows[0];
                }
            } else if (role === 'client') {
                const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM responsavel WHERE email = ?', [email]);
                console.log('Client query result:', rows); // DEBUG
                if (rows.length > 0) {
                    user = rows[0];
                }
            } else {
                console.log('Invalid role'); // DEBUG
                return res.status(400).json({ error: 'Tipo de usuário inválido.' });
            }

            if (!user) {
                console.log('User not found'); // DEBUG
                return res.status(401).json({ error: 'Usuário não encontrado.' });
            }

            // Verificação de senha com bcrypt
            // Nota: Para usuários antigos sem hash, isso falhará. 
            // Idealmente, teríamos uma migração ou verificação dupla (se não for hash, compara direto e atualiza).
            // Para este MVP, assumiremos que novos usuários usarão hash ou o admin resetará senhas.
            const passwordMatch = await bcrypt.compare(password, user.senha);

            // Fallback para senhas em texto plano (apenas para desenvolvimento/migração)
            // Se bcrypt falhar, tenta comparação direta (NÃO RECOMENDADO PARA PROD FINAL, mas útil agora)
            if (!passwordMatch && user.senha === password) {
                console.log('Plain text password match (Legacy)');
            } else if (!passwordMatch) {
                console.log('Invalid password'); // DEBUG
                return res.status(401).json({ error: 'Senha incorreta.' });
            }

            console.log('Login successful'); // DEBUG
            return res.status(200).json({
                message: 'Login realizado com sucesso!',
                user: { id: user.id, nome: user.nome, email: user.email, role }
            });

        } catch (error: any) {
            const fs = await import('fs');
            const errorMsg = `[${new Date().toISOString()}] Erro no login: ${error.stack || error}\n`;
            fs.appendFileSync('error.log', errorMsg);
            console.error('Erro no login (CATCH):', error); // DEBUG
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }
}
