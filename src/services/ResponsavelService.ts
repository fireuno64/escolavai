// src/services/ResponsavelService.ts

import { ResponsavelRepository } from '../repositories/ResponsavelRepository.js';

const repository = new ResponsavelRepository();

// Define a mesma interface usada no Repositório (ou um tipo compatível)
interface ResponsavelInput {
    nome: string;
    cpf: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    cep?: string;
    numero?: string;
    complemento?: string;
    enderecoId?: number;
    senha?: string;
    valor_contrato?: number;
    data_inicio_contrato?: Date | string;
    rg?: string;
    active?: boolean;
}

export class ResponsavelService {

    async createResponsavel(data: ResponsavelInput, adminId: number) {
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

        return repository.create(data as any, adminId);
    }

    async getResponsaveis(adminId: number) {
        return repository.findAll(adminId);
    }

    async getResponsavelById(id: number, adminId: number) {
        const responsavel = await repository.findById(id, adminId);
        if (!responsavel) {
            throw new Error("Responsável não encontrado.");
        }
        return responsavel;
    }

    async getResponsavelByCpf(cpf: string, adminId: number) {
        return repository.findByCpf(cpf, adminId);
    }

    async updateResponsavel(id: number, data: Partial<ResponsavelInput>, adminId: number) {
        return repository.update(id, data, adminId);
    }

    async deleteResponsavel(id: number, adminId: number) {
        return repository.delete(id, adminId);
    }

    async toggleActive(id: number, adminId: number) {
        const responsavel = await repository.findById(id, adminId);
        if (!responsavel) {
            throw new Error("Responsável não encontrado.");
        }

        const newStatus = !responsavel.active;
        await repository.update(id, { active: newStatus }, adminId);
        return newStatus;
    }
}