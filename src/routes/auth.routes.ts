// src/routes/auth.routes.ts

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';

const router = Router();
const controller = new AuthController();

router.post('/login', (req, res) => controller.login(req, res));

export default router;
