
// src/server.ts

import 'dotenv/config';
import express from 'express';
import fs from 'fs';

// Importa as rotas
import responsavelRoutes from './routes/responsavel.routes.js';
import pagamentoRoutes from './routes/pagamento.routes.js';
import authRoutes from './routes/auth.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import criancaRoutes from './routes/crianca.routes.js';

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(express.static('public'));

// Rotas
app.use('/api/responsaveis', responsavelRoutes);
app.use('/api/pagamentos', pagamentoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', chatbotRoutes);
app.use('/api/criancas', criancaRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API Escola Vai funcionando!');
});

// Middleware de erro global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errorMsg = `[${new Date().toISOString()}] Erro Global: ${err.stack || err}\n`;
  fs.appendFileSync('error.log', errorMsg);
  console.error('Erro Global:', err);
  res.status(500).json({ error: 'Erro interno no servidor (Global).' });
});

// Inicialização
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});