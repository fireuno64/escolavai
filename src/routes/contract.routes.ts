import { Router } from 'express';
import { ContractController } from '../controllers/ContractController.js';
import { forbidMaster } from '../middlewares/MasterMiddleware.js';

const router = Router();
const controller = new ContractController();

import { authMiddleware } from '../middlewares/authMiddleware.js';

router.use(authMiddleware);
router.use(forbidMaster);

router.get('/:responsavelId/pdf', (req, res) => controller.generateContract(req, res));

export default router;
