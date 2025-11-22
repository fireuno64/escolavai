
import { CriancaRepository } from '../repositories/CriancaRepository.js';
import { PagamentoService } from './PagamentoService.js';

const repository = new CriancaRepository();
const pagamentoService = new PagamentoService();

interface CriancaInput {
    nome: string;
    dataNascimento?: string;
    escola?: string;
    escolaId?: number;
    horario?: string;
    horarioEntrada?: string;
    horarioSaida?: string;
    tipoTransporte?: 'ida_volta' | 'so_ida' | 'so_volta';
    responsavelId: number;
    dataInicioContrato?: Date | string;
    valorContratoAnual?: number;
}

export class CriancaService {

    async createCrianca(data: CriancaInput, adminId: number) {
        if (!data.nome || !data.responsavelId) {
            throw new Error("Nome e Responsável são obrigatórios.");
        }
        console.log('=== CriancaService.createCrianca ===');
        console.log('Data received:', JSON.stringify(data, null, 2));
        console.log('dataInicioContrato:', data.dataInicioContrato);
        console.log('valorContratoAnual:', data.valorContratoAnual);

        const result = await repository.create(data, adminId);
        console.log('Repository result:', JSON.stringify(result, null, 2));

        // Generate payments if contract data is provided
        if (data.dataInicioContrato && data.valorContratoAnual && data.valorContratoAnual > 0) {
            console.log('🔄 Generating payments for new child...');
            await pagamentoService.generatePaymentsForChild(
                result.id,
                data.responsavelId,
                data.dataInicioContrato,
                data.valorContratoAnual,
                adminId
            );
        }

        return result;
    }

    async getCriancas(adminId: number) {
        return repository.findAll(adminId);
    }

    async getCriancasByResponsavel(responsavelId: number, adminId: number) {
        return repository.findByResponsavelId(responsavelId, adminId);
    }

    async getCriancaById(id: number, adminId: number) {
        const crianca = await repository.findById(id, adminId);
        if (!crianca) {
            throw new Error("Criança não encontrada.");
        }
        return crianca;
    }

    async updateCrianca(id: number, data: Partial<CriancaInput>, adminId: number) {
        const result = await repository.update(id, data, adminId);

        // Regenerate payments if contract data changed
        if (result && data.dataInicioContrato && data.valorContratoAnual && data.valorContratoAnual > 0) {
            console.log('🔄 Regenerating payments for updated child...');
            await pagamentoService.regeneratePaymentsForChild(
                id,
                result.responsavel_id,
                data.dataInicioContrato,
                data.valorContratoAnual,
                adminId
            );
        }

        return result;
    }

    async deleteCrianca(id: number, adminId: number) {
        // Delete associated payments first
        await pagamentoService.deletePaymentsForChild(id);
        return repository.delete(id, adminId);
    }
}
