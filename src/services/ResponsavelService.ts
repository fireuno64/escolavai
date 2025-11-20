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
    enderecoId?: number;
    senha?: string;
    valor_contrato?: number;
    data_inicio_contrato?: Date | string;
    rg?: string;
}

export class ResponsavelService {

    async createResponsavel(data: ResponsavelInput) {
        // Exemplo de regra de negócio: Checar se o CPF tem o formato correto
        if (!data.cpf || data.cpf.length < 11) {
            throw new Error("CPF inválido.");
        }
        return repository.create(data as any); // Cast to any to avoid strict type mismatch if DTO differs slightly
    }

    async getResponsaveis() {
        return repository.findAll();
    }

    async getResponsavelById(id: number) {
        const responsavel = await repository.findById(id);
        if (!responsavel) {
            throw new Error("Responsável não encontrado.");
        }
        return responsavel;
    }

    async getResponsavelByCpf(cpf: string) {
        return repository.findByCpf(cpf);
    }

    async updateResponsavel(id: number, data: Partial<ResponsavelInput>) {
        return repository.update(id, data);
    }

    async deleteResponsavel(id: number) {
        return repository.delete(id);
    }
}