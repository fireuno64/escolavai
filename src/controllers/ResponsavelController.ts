import { Request, Response } from 'express';
import { ResponsavelService } from '../services/ResponsavelService.js';
import bcrypt from 'bcrypt';

const service = new ResponsavelService();

export class ResponsavelController {

    async create(req: Request, res: Response) {
        try {
            const { nome, cpf, telefone, email, endereco, senha, valor_contrato, data_inicio_contrato, rg } = req.body;

            if (!nome || !cpf || !senha) {
                return res.status(400).json({ error: 'Nome, CPF e senha são obrigatórios' });
            }

            if (!data_inicio_contrato) {
                return res.status(400).json({ error: 'Data de início do contrato é obrigatória' });
            }

            if (!valor_contrato) {
                return res.status(400).json({ error: 'Valor do contrato é obrigatório' });
            }

            // Check if CPF already exists
            const existingResponsavel = await service.getResponsavelByCpf(cpf);
            if (existingResponsavel) {
                return res.status(400).json({ error: 'CPF já cadastrado no sistema' });
            }

            const hashedPassword = await bcrypt.hash(senha, 10);

            const responsavel = await service.createResponsavel({
                nome,
                cpf,
                telefone,
                email,
                endereco,
                enderecoId: 1,
                senha: hashedPassword,
                valor_contrato: parseFloat(valor_contrato),
                data_inicio_contrato,
                rg
            });

            return res.status(201).json(responsavel);
        } catch (error: any) {
            return res.status(400).json({ error: 'Erro ao criar responsável: ' + error.message });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const responsaveis = await service.getResponsaveis();
            return res.status(200).json(responsaveis);
        } catch (error) {
            console.error('Erro no findAll:', error);
            return res.status(500).json({ error: 'Erro ao listar responsáveis.' });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const responsavel = await service.getResponsavelById(id);
            return res.status(200).json(responsavel);
        } catch (error: any) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro ao buscar responsável.' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const responsavelAtualizado = await service.updateResponsavel(id, req.body);
            return res.status(200).json(responsavelAtualizado);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar responsável.' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await service.deleteResponsavel(id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar responsável.' });
        }
    }
}