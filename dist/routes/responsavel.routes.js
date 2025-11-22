// src/routes/responsavelRoutes.ts
import { Router } from 'express';
import { ResponsavelController } from '../controllers/ResponsavelController.js';
import { forbidMaster } from '../middlewares/MasterMiddleware.js';
const router = Router();
const controller = new ResponsavelController();
import { authMiddleware } from '../middlewares/authMiddleware.js';
router.use(authMiddleware);
router.use(forbidMaster);
// Rotas CRUD
router.post('/', (req, res) => controller.create(req, res));
router.get('/', (req, res) => controller.findAll(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.put('/:id/toggle-active', (req, res) => controller.toggleActive(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));
export default router;
