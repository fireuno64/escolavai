import { ResponsavelService } from '../services/ResponsavelService.js';
import bcrypt from 'bcrypt';
const service = new ResponsavelService();
export class ResponsavelController {
    async create(req, res) {
        try {
            // Use adminId from user. If not authenticated, this should fail or be handled by middleware.
            const adminId = req.user?.id;
            console.log('ResponsavelController.create - Authenticated User ID:', adminId);
            if (!adminId) {
                return res.status(401).json({ error: 'Usuário não autenticado.' });
            }
            const { nome, cpf, telefone, email, endereco, cep, rua, numero, complemento, bairro, cidade, estado, enderecoId, senha, valor_contrato, data_inicio_contrato, rg } = req.body;
            console.log('ResponsavelController.create - Request body:', req.body);
            if (!nome || !cpf) {
                return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
            }
            // Contract fields are now optional on parent (moved to children)
            // if (!data_inicio_contrato) { ... }
            // if (!valor_contrato) { ... }
            // Check if CPF already exists (Service now handles adminId check)
            // const existingResponsavel = await service.getResponsavelByCpf(cpf, adminId);
            // if (existingResponsavel) {
            //     return res.status(400).json({ error: 'CPF já cadastrado no sistema' });
            // }
            // Hash password if provided, otherwise use default
            const hashedPassword = senha ? await bcrypt.hash(senha, 10) : await bcrypt.hash('senha123', 10);
            const responsavel = await service.createResponsavel({
                nome,
                cpf,
                telefone,
                email,
                endereco,
                cep,
                rua,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                enderecoId: 1,
                senha: hashedPassword,
                rg
            }, adminId);
            console.log('ResponsavelController.create - Created responsavel:', responsavel);
            return res.status(201).json(responsavel);
        }
        catch (error) {
            console.error('ResponsavelController.create - Error:', error);
            return res.status(400).json({ error: 'Erro ao criar responsável: ' + error.message });
        }
    }
    async findAll(req, res) {
        try {
            const adminId = req.user?.id;
            if (!adminId)
                return res.status(401).json({ error: 'Usuário não autenticado.' });
            const responsaveis = await service.getResponsaveis(adminId);
            return res.status(200).json(responsaveis);
        }
        catch (error) {
            console.error('Erro no findAll:', error);
            return res.status(500).json({ error: 'Erro ao listar responsáveis.' });
        }
    }
    async findById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const adminId = req.user?.id;
            if (!adminId)
                return res.status(401).json({ error: 'Usuário não autenticado.' });
            const responsavel = await service.getResponsavelById(id, adminId);
            return res.status(200).json(responsavel);
        }
        catch (error) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Erro ao buscar responsável.' });
        }
    }
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            const adminId = req.user?.id;
            if (!adminId)
                return res.status(401).json({ error: 'Usuário não autenticado.' });
            const { nome, cpf, telefone, email, endereco, cep, rua, numero, complemento, bairro, cidade, estado, enderecoId, senha, valor_contrato, data_inicio_contrato, rg } = req.body;
            const dataToUpdate = {
                nome,
                cpf,
                telefone,
                email,
                endereco,
                cep,
                rua,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                enderecoId,
                valor_contrato,
                data_inicio_contrato,
                rg
            };
            if (senha) {
                dataToUpdate.senha = await bcrypt.hash(senha, 10);
            }
            const responsavelAtualizado = await service.updateResponsavel(id, dataToUpdate, adminId);
            return res.status(200).json(responsavelAtualizado);
        }
        catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar responsável.' });
        }
    }
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            const adminId = req.user?.id;
            if (!adminId)
                return res.status(401).json({ error: 'Usuário não autenticado.' });
            await service.deleteResponsavel(id, adminId);
            return res.status(204).send();
        }
        catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar responsável.' });
        }
    }
    async toggleActive(req, res) {
        try {
            const id = parseInt(req.params.id);
            const adminId = req.user?.id;
            if (!adminId)
                return res.status(401).json({ error: 'Usuário não autenticado.' });
            // We can use the service or direct connection. 
            // Since we haven't added toggleActive to service, let's add it there or use direct connection.
            // To keep it clean, let's assume we will add it to service or use a direct query here if we import connection.
            // But we don't have connection imported. Let's use the service.
            // I will add toggleActive to ResponsavelService in the next step.
            const newState = await service.toggleActive(id, adminId);
            return res.status(200).json({ message: `Responsável ${newState ? 'ativado' : 'desativado'} com sucesso.`, active: newState });
        }
        catch (error) {
            return res.status(500).json({ error: 'Erro ao alterar status do responsável: ' + error.message });
        }
    }
}
