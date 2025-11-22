// src/services/ResponsavelService.ts
import { ResponsavelRepository } from '../repositories/ResponsavelRepository.js';
const repository = new ResponsavelRepository();
export class ResponsavelService {
    async createResponsavel(data, adminId) {
        // Exemplo de regra de negócio: Checar se o CPF tem o formato correto
        if (!data.cpf || data.cpf.length < 11) {
            throw new Error("CPF inválido.");
        }
        if (data.email) {
            const existingEmail = await repository.findByEmail(data.email, adminId);
            if (existingEmail) {
                throw new Error("Email já cadastrado.");
            }
        }
        // Check if CPF already exists for this admin
        const existingCpf = await repository.findByCpf(data.cpf, adminId);
        if (existingCpf) {
            throw new Error("CPF já cadastrado no sistema.");
        }
        return repository.create(data, adminId);
    }
    async getResponsaveis(adminId) {
        return repository.findAll(adminId);
    }
    async getResponsavelById(id, adminId) {
        const responsavel = await repository.findById(id, adminId);
        if (!responsavel) {
            throw new Error("Responsável não encontrado.");
        }
        return responsavel;
    }
    async getResponsavelByCpf(cpf, adminId) {
        return repository.findByCpf(cpf, adminId);
    }
    async updateResponsavel(id, data, adminId) {
        return repository.update(id, data, adminId);
    }
    async deleteResponsavel(id, adminId) {
        return repository.delete(id, adminId);
    }
    async toggleActive(id, adminId) {
        const responsavel = await repository.findById(id, adminId);
        if (!responsavel) {
            throw new Error("Responsável não encontrado.");
        }
        const newStatus = !responsavel.active;
        await repository.update(id, { active: newStatus }, adminId);
        return newStatus;
    }
}
