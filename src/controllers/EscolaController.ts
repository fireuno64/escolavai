import { Request, Response } from 'express';
import { EscolaService } from '../services/EscolaService.js';

const escolaService = new EscolaService();

export class EscolaController {
    async create(req: Request, res: Response) {
        try {
            const adminId = (req as any).user.id;
            const data = { ...req.body, adminId };
            const escola = await escolaService.createEscola(data);
            res.status(201).json(escola);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const adminId = (req as any).user.id;
            const escolas = await escolaService.getEscolas(adminId);
            res.json(escolas);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const adminId = (req as any).user.id;
            const escola = await escolaService.getEscolaById(Number(req.params.id), adminId);
            if (!escola) {
                return res.status(404).json({ error: 'Escola não encontrada' });
            }
            res.json(escola);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const adminId = (req as any).user.id;
            const escola = await escolaService.updateEscola(Number(req.params.id), req.body, adminId);
            if (!escola) {
                return res.status(404).json({ error: 'Escola não encontrada' });
            }
            res.json(escola);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const adminId = (req as any).user.id;
            const success = await escolaService.deleteEscola(Number(req.params.id), adminId);
            if (!success) {
                return res.status(404).json({ error: 'Escola não encontrada' });
            }
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
