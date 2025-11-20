// src/controllers/PagamentoController.ts

import { Request, Response } from 'express';
import { PagamentoService } from '../services/PagamentoService.js';

const service = new PagamentoService();

export class PagamentoController {

    async create(req: Request, res: Response) {
        try {
            const novoPagamento = await service.createPagamento(req.body);
            return res.status(201).json(novoPagamento);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao criar pagamento: ' + error.message });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const pagamentos = await service.getPagamentos();
            return res.status(200).json(pagamentos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar pagamentos.' });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const pagamento = await service.getPagamentoById(id);
            return res.status(200).json(pagamento);
        } catch (error: any) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro ao buscar pagamento.' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const pagamentoAtualizado = await service.updatePagamento(id, req.body);
            return res.status(200).json(pagamentoAtualizado);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar pagamento.' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await service.deletePagamento(id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar pagamento.' });
        }
    }
}
