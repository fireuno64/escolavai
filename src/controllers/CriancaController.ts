
import { Request, Response } from 'express';
import { CriancaService } from '../services/CriancaService.js';

const service = new CriancaService();

export class CriancaController {

    async create(req: Request, res: Response) {
        try {
            const adminId = (req as any).user?.id || 1;
            console.log('=== CriancaController.create ===');
            console.log('Request body:', JSON.stringify(req.body, null, 2));
            console.log('dataInicioContrato:', req.body.dataInicioContrato);
            console.log('valorContratoAnual:', req.body.valorContratoAnual);

            const novaCrianca = await service.createCrianca(req.body, adminId);
            console.log('Created crianca:', JSON.stringify(novaCrianca, null, 2));
            return res.status(201).json(novaCrianca);
        } catch (error: any) {
            console.error('Error in CriancaController.create:', error);
            return res.status(400).json({ error: 'Erro ao cadastrar criança: ' + error.message });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const adminId = (req as any).user?.id || 1;
            const criancas = await service.getCriancas(adminId);
            return res.status(200).json(criancas);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar crianças.' });
        }
    }

    async findByResponsavel(req: Request, res: Response) {
        try {
            const responsavelId = parseInt(req.params.responsavelId);
            const adminId = (req as any).user?.id || 1;
            const criancas = await service.getCriancasByResponsavel(responsavelId, adminId);
            return res.status(200).json(criancas);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar crianças do responsável.' });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const adminId = (req as any).user?.id || 1;
            const crianca = await service.getCriancaById(id, adminId);
            return res.status(200).json(crianca);
        } catch (error: any) {
            if (error.message.includes("não encontrada")) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro ao buscar criança.' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const adminId = (req as any).user?.id || 1;
            const criancaAtualizada = await service.updateCrianca(id, req.body, adminId);
            return res.status(200).json(criancaAtualizada);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar criança.' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const adminId = (req as any).user?.id || 1;
            await service.deleteCrianca(id, adminId);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar criança.' });
        }
    }
}
