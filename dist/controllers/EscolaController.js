import { EscolaService } from '../services/EscolaService.js';
const escolaService = new EscolaService();
export class EscolaController {
    async create(req, res) {
        try {
            const adminId = req.user.id;
            const { nome, endereco, cep, rua, numero, complemento, bairro, cidade, estado, contato, telefone, email } = req.body;
            const data = { nome, endereco, cep, rua, numero, complemento, bairro, cidade, estado, contato, telefone, email, adminId };
            const escola = await escolaService.createEscola(data);
            res.status(201).json(escola);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const adminId = req.user.id;
            const escolas = await escolaService.getEscolas(adminId);
            res.json(escolas);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getById(req, res) {
        try {
            const adminId = req.user.id;
            const escola = await escolaService.getEscolaById(Number(req.params.id), adminId);
            if (!escola) {
                return res.status(404).json({ error: 'Escola não encontrada' });
            }
            res.json(escola);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async update(req, res) {
        try {
            const adminId = req.user.id;
            const { nome, endereco, cep, rua, numero, complemento, bairro, cidade, estado, contato, telefone, email } = req.body;
            const escola = await escolaService.updateEscola(Number(req.params.id), { nome, endereco, cep, rua, numero, complemento, bairro, cidade, estado, contato, telefone, email }, adminId);
            if (!escola) {
                return res.status(404).json({ error: 'Escola não encontrada' });
            }
            res.json(escola);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const adminId = req.user.id;
            const success = await escolaService.deleteEscola(Number(req.params.id), adminId);
            if (!success) {
                return res.status(404).json({ error: 'Escola não encontrada' });
            }
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
