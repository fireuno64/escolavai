import { Router } from 'express';
import { ContratoController } from '../controllers/ContratoController.js';
import { ContractController } from '../controllers/ContractController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
const controller = new ContratoController();
const pdfController = new ContractController();
// Todas as rotas requerem autenticação
router.use(authMiddleware);
// POST /api/contratos - Create new contract
router.post('/', (req, res) => controller.createNewContract(req, res));
// POST /api/contratos/:id/renew - Renew expired contract
router.post('/:id/renew', (req, res) => controller.renewContract(req, res));
// GET /api/contratos/crianca/:id - Get contract history for a child
router.get('/crianca/:id', (req, res) => controller.getContractHistory(req, res));
// GET /api/contratos/crianca/:id/active - Get active contract for a child
router.get('/crianca/:id/active', (req, res) => controller.getActiveContract(req, res));
// PUT /api/contratos/:id/cancel - Cancel active contract
router.put('/:id/cancel', (req, res) => controller.cancelContract(req, res));
// GET /api/contratos/archived - Get archived contracts
router.get('/archived', (req, res) => controller.getArchivedContracts(req, res));
// POST /api/contratos/archive-expired - Archive expired contracts
router.post('/archive-expired', (req, res) => controller.archiveExpiredContracts(req, res));
// GET /api/contratos/:responsavelId/pdf - Generate Contract PDF
router.get('/:responsavelId/pdf', (req, res) => pdfController.generateContract(req, res));
export default router;
