/**
 * @swagger
 * tags:
 *   - name: Autenticação
 *     description: Endpoints de autenticação e perfil
 *   - name: Responsáveis
 *     description: Gerenciamento de responsáveis
 *   - name: Crianças
 *     description: Gerenciamento de crianças
 *   - name: Escolas
 *     description: Gerenciamento de escolas
 *   - name: Pagamentos
 *     description: Gerenciamento de pagamentos
 *   - name: Contratos
 *     description: Geração de contratos em PDF
 *   - name: Usuários Admin
 *     description: Gerenciamento de usuários administrativos
 */

/**
 * @swagger
 * /api/responsaveis:
 *   get:
 *     summary: Listar todos os responsáveis
 *     description: Retorna lista de responsáveis do admin autenticado
 *     tags: [Responsáveis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de responsáveis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Responsavel'
 *   post:
 *     summary: Criar novo responsável
 *     description: Cria um novo responsável vinculado ao admin autenticado
 *     tags: [Responsáveis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResponsavelInput'
 *     responses:
 *       201:
 *         description: Responsável criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Responsavel'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/responsaveis/{id}:
 *   get:
 *     summary: Buscar responsável por ID
 *     tags: [Responsáveis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do responsável
 *     responses:
 *       200:
 *         description: Dados do responsável
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Responsavel'
 *       404:
 *         description: Responsável não encontrado
 *   put:
 *     summary: Atualizar responsável
 *     tags: [Responsáveis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResponsavelInput'
 *     responses:
 *       200:
 *         description: Responsável atualizado
 *   delete:
 *     summary: Deletar responsável
 *     tags: [Responsáveis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Responsável deletado
 */

/**
 * @swagger
 * /api/criancas:
 *   get:
 *     summary: Listar todas as crianças
 *     tags: [Crianças]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de crianças
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Crianca'
 *   post:
 *     summary: Criar nova criança
 *     tags: [Crianças]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Crianca'
 *     responses:
 *       201:
 *         description: Criança criada com sucesso
 */

/**
 * @swagger
 * /api/escolas:
 *   get:
 *     summary: Listar todas as escolas
 *     tags: [Escolas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de escolas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Escola'
 *   post:
 *     summary: Criar nova escola
 *     tags: [Escolas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome:
 *                 type: string
 *               endereco:
 *                 type: string
 *               telefone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Escola criada
 */

/**
 * @swagger
 * /api/pagamentos:
 *   get:
 *     summary: Listar todos os pagamentos
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pagamento'
 */

/**
 * @swagger
 * /api/pagamentos/{id}:
 *   put:
 *     summary: Atualizar status de pagamento
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pendente, Pago, Vencido]
 *     responses:
 *       200:
 *         description: Pagamento atualizado
 */

/**
 * @swagger
 * /api/contracts/{responsavelId}/pdf:
 *   get:
 *     summary: Gerar contrato em PDF
 *     description: Gera contrato de prestação de serviço em PDF para um responsável
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responsavelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do responsável
 *     responses:
 *       200:
 *         description: PDF do contrato
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Responsável não encontrado
 */

/**
 * @swagger
 * /api/admin-users:
 *   get:
 *     summary: Listar usuários administrativos
 *     description: Lista todos os usuários (admins e clientes)
 *     tags: [Usuários Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminUser'
 *   post:
 *     summary: Criar novo usuário admin
 *     tags: [Usuários Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, password, role]
 *             properties:
 *               nome: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               role: { type: string, enum: [admin, cliente] }
 *     responses:
 *       201:
 *         description: Usuário criado
 */

export { };
