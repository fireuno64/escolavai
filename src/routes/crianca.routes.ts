
import { Router } from 'express';
import { CriancaController } from '../controllers/CriancaController.js';

const router = Router();
const controller = new CriancaController();

router.post('/', controller.create.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.get('/responsavel/:responsavelId', controller.findByResponsavel.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
