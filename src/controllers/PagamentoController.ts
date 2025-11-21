// src/controllers/PagamentoController.ts

import { Request, Response } from 'express';
import { PagamentoService } from '../services/PagamentoService.js';

const service = new PagamentoService();

export class PagamentoController {

    async create(req: Request, res: Response) {
        try {
            const adminId = (req as any).user?.id || 1;
            const novoPagamento = await service.createPagamento(req.body, adminId);
            return res.status(201).json(novoPagamento);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao criar pagamento: ' + error.message });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const adminId = (req as any).user?.id || 1;
            const pagamentos = await service.getPagamentos(adminId);
            return res.status(200).json(pagamentos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar pagamentos.' });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const adminId = (req as any).user?.id || 1;
            const pagamento = await service.getPagamentoById(id, adminId);
            return res.status(200).json(pagamento);
        } catch (error: any) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro ao buscar pagamento.' });
        }
    }

    async findByResponsavel(req: Request, res: Response) {
        try {
            const responsavelId = parseInt(req.params.responsavelId);
            // Security check: Ensure the requesting user is the responsavel or an admin
            // For now, we'll assume the route protection handles basic auth, 
            // but ideally we should check if req.user.id === responsavelId if role is client

            const pagamentos = await service.getPagamentosByResponsavel(responsavelId);
            return res.status(200).json(pagamentos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar pagamentos do responsável.' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const adminId = (req as any).user?.id || 1;
            const pagamentoAtualizado = await service.updatePagamento(id, req.body, adminId);
            return res.status(200).json(pagamentoAtualizado);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar pagamento.' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const adminId = (req as any).user?.id || 1;
            await service.deletePagamento(id, adminId);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar pagamento.' });
        }
    }
}
