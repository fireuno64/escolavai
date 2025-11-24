// src/controllers/AuthController.ts
import connection from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export class AuthController {
    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Autenticar usuário
     *     description: Realiza login de usuário (Master, Admin ou Cliente) e retorna token JWT
     *     tags: [Autenticação]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       200:
     *         description: Login realizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/LoginResponse'
     *       400:
     *         description: Email e senha são obrigatórios
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Credenciais inválidas
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Conta desativada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async login(req, res) {
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
            const [adminRows] = await connection.execute('SELECT * FROM admin WHERE email = ?', [email]);
            if (adminRows.length > 0) {
                user = adminRows[0];
                userRole = user.role; // 'master' or 'admin'
                console.log(`Found in admin table with role: ${userRole}`); // DEBUG
                // Check if admin user is active
                if (!user.active) {
                    console.log('User is inactive'); // DEBUG
                    return res.status(403).json({
                        error: 'Sua conta está desativada. Entre em contato com o administrador.'
                    });
                }
            }
            else {
                // If not found in admin, check responsavel table
                console.log('Not found in admin, checking responsavel table...'); // DEBUG
                const [responsavelRows] = await connection.execute('SELECT * FROM responsavel WHERE email = ?', [email]);
                if (responsavelRows.length > 0) {
                    user = responsavelRows[0];
                    userRole = 'cliente'; // Responsavel is always 'cliente'
                    console.log('Found in responsavel table as cliente'); // DEBUG
                    if (!user.active) {
                        console.log('User is inactive'); // DEBUG
                        return res.status(403).json({
                            error: 'Sua conta está desativada. Entre em contato com o administrador.'
                        });
                    }
                }
                else {
                    console.log('User not found in any table'); // DEBUG
                    return res.status(401).json({ error: 'Usuário não encontrado.' });
                }
            }
            // Verificação de senha com bcrypt
            const passwordMatch = await bcrypt.compare(password, user.senha);
            // Fallback para senhas em texto plano (apenas para desenvolvimento/migração)
            if (!passwordMatch && user.senha === password) {
                console.log('Plain text password match (Legacy)');
            }
            else if (!passwordMatch) {
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
            // Check for first access (incomplete profile)
            let isFirstAccess = false;
            if (userRole === 'admin' || userRole === 'master') {
                // Consider first access if address is missing (check rua since form uses structured address)
                if (!user.rua || user.rua.trim() === '') {
                    isFirstAccess = true;
                }
            }
            return res.status(200).json({
                message: 'Login realizado com sucesso!',
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    cpf_cnpj: user.cpf_cnpj,
                    endereco: user.endereco,
                    cep: user.cep,
                    rua: user.rua,
                    numero: user.numero,
                    complemento: user.complemento,
                    bairro: user.bairro,
                    cidade: user.cidade,
                    estado: user.estado,
                    role: userRole,
                    isFirstAccess, // Flag for frontend
                    token // Return token to frontend
                }
            });
        }
        catch (error) {
            const fs = await import('fs');
            const errorMsg = `[${new Date().toISOString()}] Erro no login: ${error.stack || error}\n`;
            fs.appendFileSync('error.log', errorMsg);
            console.error('Erro no login (CATCH):', error); // DEBUG
            return res.status(500).json({ error: 'Erro interno no servidor.' });
        }
    }
    /**
     * @swagger
     * /api/auth/profile:
     *   put:
     *     summary: Atualizar perfil do usuário
     *     description: Atualiza informações do perfil do usuário autenticado (nome, email, CPF/CNPJ, endereço, senha)
     *     tags: [Autenticação]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [id, nome, email]
     *             properties:
     *               id:
     *                 type: integer
     *                 description: ID do usuário
     *               nome:
     *                 type: string
     *                 description: Nome completo
     *               email:
     *                 type: string
     *                 format: email
     *                 description: Email do usuário
     *               cpf_cnpj:
     *                 type: string
     *                 description: CPF ou CNPJ
     *               endereco:
     *                 type: string
     *                 description: Endereço completo
     *               password:
     *                 type: string
     *                 format: password
     *                 description: Nova senha (opcional)
     *     responses:
     *       200:
     *         description: Perfil atualizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id: { type: integer }
     *                 nome: { type: string }
     *                 email: { type: string }
     *                 cpf_cnpj: { type: string }
     *                 endereco: { type: string }
     *       400:
     *         description: Dados inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    async updateProfile(req, res) {
        const { id, nome, email, password, cpf_cnpj, endereco, cep, rua, numero, complemento, bairro, cidade, estado } = req.body;
        if (!id || !nome || !email) {
            return res.status(400).json({ error: 'ID, nome e email são obrigatórios.' });
        }
        try {
            let query = 'UPDATE admin SET nome = ?, email = ?';
            let params = [nome, email];
            // Add cpf_cnpj if provided
            if (cpf_cnpj !== undefined) {
                query += ', cpf_cnpj = ?';
                params.push(cpf_cnpj);
            }
            // Add endereco if provided
            if (endereco !== undefined) {
                query += ', endereco = ?';
                params.push(endereco);
            }
            // Add new address fields
            if (cep !== undefined) {
                query += ', cep = ?';
                params.push(cep);
            }
            if (rua !== undefined) {
                query += ', rua = ?';
                params.push(rua);
            }
            if (numero !== undefined) {
                query += ', numero = ?';
                params.push(numero);
            }
            if (complemento !== undefined) {
                query += ', complemento = ?';
                params.push(complemento);
            }
            if (bairro !== undefined) {
                query += ', bairro = ?';
                params.push(bairro);
            }
            if (cidade !== undefined) {
                query += ', cidade = ?';
                params.push(cidade);
            }
            if (estado !== undefined) {
                query += ', estado = ?';
                params.push(estado);
            }
            if (password) {
                // Hash password if provided
                const hashedPassword = await bcrypt.hash(password, 10);
                query += ', senha = ?';
                params.push(hashedPassword);
            }
            query += ' WHERE id = ?';
            params.push(id);
            await connection.query(query, params);
            res.json({ id, nome, email, cpf_cnpj, endereco, cep, rua, numero, complemento, bairro, cidade, estado });
        }
        catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({ error: 'Erro ao atualizar perfil.' });
        }
    }
}
