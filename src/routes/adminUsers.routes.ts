import { Router } from 'express';
import { AdminUserController } from '../controllers/AdminUserController.js';
import { requireMaster } from '../middlewares/MasterMiddleware.js';

const router = Router();
const controller = new AdminUserController();

import { authMiddleware } from '../middlewares/authMiddleware.js';

router.use(authMiddleware);
router.use(requireMaster);

router.get('/', controller.listAdmins);
router.post('/', controller.createAdmin);
router.put('/:id', controller.updateAdmin);
router.put('/:id/toggle-active', controller.toggleActive);
router.delete('/:id', controller.deleteAdmin);

export default router;
