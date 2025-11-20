// src/routes/responsavelRoutes.ts

import { Router } from 'express';
import { ResponsavelController } from '../controllers/ResponsavelController.js';

const router = Router();
const controller = new ResponsavelController();

// Rotas CRUD
router.post('/', (req, res) => controller.create(req, res));
router.get('/', (req, res) => controller.findAll(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;