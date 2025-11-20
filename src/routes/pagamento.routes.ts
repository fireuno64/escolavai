// src/routes/pagamento.routes.ts

import { Router } from 'express';
import { PagamentoController } from '../controllers/PagamentoController.js';

const router = Router();
const controller = new PagamentoController();

// Rotas CRUD
router.post('/', (req, res) => controller.create(req, res));
router.get('/', (req, res) => controller.findAll(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
