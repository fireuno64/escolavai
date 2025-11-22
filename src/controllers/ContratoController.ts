
import { Request, Response } from 'express';
import { ContratoService } from '../services/ContratoService.js';

const service = new ContratoService();

export class ContratoController {

    /**
     * POST /api/contratos - Create new contract (replaces active contract)
     */
    async createNewContract(req: Request, res: Response) {
        try {
            const adminId = (req as any).user?.id || 1;
            const { criancaId, responsavelId, dataInicio, valorAnual, motivoCancelamento, observacoes } = req.body;

            if (!criancaId || !responsavelId || !dataInicio || !valorAnual) {
                return res.status(400).json({
                    error: 'criancaId, responsavelId, dataInicio e valorAnual são obrigatórios'
                });
            }

            const novoContrato = await service.createNewContract({
                criancaId,
                responsavelId,
                adminId,
                dataInicio,
                valorAnual,
                motivoCancelamento,
                observacoes
            });

            return res.status(201).json(novoContrato);
        } catch (error: any) {
            console.error('Error in createNewContract:', error);
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * POST /api/contratos/:id/renew - Renew expired contract
     */
    async renewContract(req: Request, res: Response) {
        try {
            const contratoVencidoId = parseInt(req.params.id);
            const { dataInicio, percentualReajuste, observacoes } = req.body;

            const novoContrato = await service.renewContract({
                contratoVencidoId,
                dataInicio,
                percentualReajuste,
                observacoes
            });

            return res.status(201).json(novoContrato);
        } catch (error: any) {
            console.error('Error in renewContract:', error);
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * GET /api/contratos/crianca/:id - Get contract history for a child
     */
    async getContractHistory(req: Request, res: Response) {
        try {
            const criancaId = parseInt(req.params.id);
            const contratos = await service.getContractHistory(criancaId);
            return res.status(200).json(contratos);
        } catch (error: any) {
            console.error('Error in getContractHistory:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /api/contratos/crianca/:id/active - Get active contract for a child
     */
    async getActiveContract(req: Request, res: Response) {
        try {
            const criancaId = parseInt(req.params.id);
            const contrato = await service.getActiveContract(criancaId);

            if (!contrato) {
                return res.status(404).json({ error: 'Nenhum contrato ativo encontrado' });
            }

            return res.status(200).json(contrato);
        } catch (error: any) {
            console.error('Error in getActiveContract:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * PUT /api/contratos/:id/cancel - Cancel active contract
     */
    async cancelContract(req: Request, res: Response) {
        try {
            const contratoId = parseInt(req.params.id);
            const { motivo } = req.body;

            if (!motivo) {
                return res.status(400).json({ error: 'Motivo do cancelamento é obrigatório' });
            }

            await service.cancelContract(contratoId, motivo);
            return res.status(200).json({ message: 'Contrato cancelado com sucesso' });
        } catch (error: any) {
            console.error('Error in cancelContract:', error);
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * GET /api/contratos/archived - Get archived contracts
     */
    async getArchivedContracts(req: Request, res: Response) {
        try {
            const adminId = (req as any).user?.id || 1;
            const contratos = await service.getArchivedContracts(adminId);
            return res.status(200).json(contratos);
        } catch (error: any) {
            console.error('Error in getArchivedContracts:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * POST /api/contratos/archive-expired - Archive expired contracts (cron job)
     */
    async archiveExpiredContracts(req: Request, res: Response) {
        try {
            const adminId = (req as any).user?.id || 1;
            const arquivados = await service.archiveExpiredContracts(adminId);
            return res.status(200).json({
                message: `${arquivados} contratos arquivados com sucesso`
            });
        } catch (error: any) {
            console.error('Error in archiveExpiredContracts:', error);
            return res.status(500).json({ error: error.message });
        }
    }
}
