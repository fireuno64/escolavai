
import { CriancaRepository } from '../repositories/CriancaRepository.js';

const repository = new CriancaRepository();

interface CriancaInput {
    nome: string;
    escola: string;
    horario: string;
    responsavelId: number;
}

export class CriancaService {

    async createCrianca(data: CriancaInput) {
        if (!data.nome || !data.responsavelId) {
            throw new Error("Nome e Responsável são obrigatórios.");
        }
        return repository.create(data);
    }

    async getCriancas() {
        return repository.findAll();
    }

    async getCriancasByResponsavel(responsavelId: number) {
        return repository.findByResponsavelId(responsavelId);
    }

    async getCriancaById(id: number) {
        const crianca = await repository.findById(id);
        if (!crianca) {
            throw new Error("Criança não encontrada.");
        }
        return crianca;
    }

    async updateCrianca(id: number, data: Partial<CriancaInput>) {
        return repository.update(id, data);
    }

    async deleteCrianca(id: number) {
        return repository.delete(id);
    }
}
