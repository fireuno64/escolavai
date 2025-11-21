// src/routes/pagamento.routes.ts

import { Router } from 'express';
import { PagamentoController } from '../controllers/PagamentoController.js';
import { forbidMaster } from '../middlewares/MasterMiddleware.js';

const router = Router();
const controller = new PagamentoController();

import { authMiddleware } from '../middlewares/authMiddleware.js';

router.use(authMiddleware);
router.use(forbidMaster);

// Rotas CRUD
router.post('/', (req, res) => controller.create(req, res));
router.get('/', (req, res) => controller.findAll(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));
router.get('/responsavel/:responsavelId', (req, res) => controller.findByResponsavel(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
