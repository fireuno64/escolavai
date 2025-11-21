// src/routes/auth.routes.ts

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login);
router.put('/profile', authController.updateProfile);

export default router;
