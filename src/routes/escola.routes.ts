import { Router } from 'express';
import { EscolaController } from '../controllers/EscolaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const escolaController = new EscolaController();

router.use(authMiddleware);

router.post('/', escolaController.create);
router.get('/', escolaController.getAll);
router.get('/:id', escolaController.getById);
router.put('/:id', escolaController.update);
router.delete('/:id', escolaController.delete);

export default router;
