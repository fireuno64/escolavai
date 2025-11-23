// src/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
// Importa as rotas
import responsavelRoutes from './routes/responsavel.routes.js';
import pagamentoRoutes from './routes/pagamento.routes.js';
import authRoutes from './routes/auth.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import criancaRoutes from './routes/crianca.routes.js';
import adminUsersRoutes from './routes/adminUsers.routes.js';
import contractRoutes from './routes/contrato.routes.js';
import escolaRoutes from './routes/escola.routes.js';
const app = express();
const PORT = 3000;
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Escola Van API Docs'
}));
// Servir arquivos estáticos da pasta public
app.use(express.static('public'));
// Rotas
app.use('/api/responsaveis', responsavelRoutes);
app.use('/api/pagamentos', pagamentoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', chatbotRoutes);
app.use('/api/criancas', criancaRoutes);
app.use('/api/admin-users', adminUsersRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/escolas', escolaRoutes);
// Rota de teste
app.get('/', (req, res) => {
    res.send('API Escola Van funcionando!');
});
// Middleware de erro global
app.use((err, req, res, next) => {
    const errorMsg = `[${new Date().toISOString()}] Erro Global: ${err.stack || err}\n`;
    fs.appendFileSync('error.log', errorMsg);
    console.error('Erro Global:', err);
    res.status(500).json({ error: 'Erro interno no servidor (Global).' });
});
// Inicialização
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
