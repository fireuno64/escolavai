
import { ContratoRepository, ContratoDTO } from '../repositories/ContratoRepository.js';
import { PagamentoService } from './PagamentoService.js';

const repository = new ContratoRepository();
const pagamentoService = new PagamentoService();

export class ContratoService {

    /**
     * Criar novo contrato (substitui o contrato ativo atual se existir)
     */
    async createNewContract(data: {
        criancaId: number;
        responsavelId: number;
        adminId: number;
        dataInicio: string | Date;
        valorAnual: number;
        motivoCancelamento?: string;
        observacoes?: string;
    }): Promise<ContratoDTO> {
        // 1. Verificar se existe contrato ativo
        const contratoAtivo = await repository.findActiveByCriancaId(data.criancaId);

        if (contratoAtivo) {
            // 2. Cancelar contrato ativo atual
            await repository.updateStatus(
                contratoAtivo.id!,
                'CANCELADO',
                data.motivoCancelamento || 'Substituído por novo contrato'
            );

            // 3. Deletar pagamentos pendentes do contrato cancelado
            await pagamentoService.deletePaymentsByContractId(contratoAtivo.id!);
        }

        // 4. Calcular data fim (1 ano após início)
        const dataInicio = new Date(data.dataInicio);
        const dataFim = new Date(dataInicio);
        dataFim.setFullYear(dataFim.getFullYear() + 1);
        dataFim.setDate(dataFim.getDate() - 1); // Último dia antes de completar 1 ano

        // 5. Calcular valor mensal
        const valorMensal = data.valorAnual / 12;

        // 6. Criar novo contrato
        const novoContrato = await repository.create({
            criancaId: data.criancaId,
            responsavelId: data.responsavelId,
            adminId: data.adminId,
            dataInicio: dataInicio,
            dataFim: dataFim,
            valorAnual: data.valorAnual,
            valorMensal: valorMensal,
            status: 'ATIVO',
            contratoAnteriorId: contratoAtivo?.id || null,
            observacoes: data.observacoes || null
        });

        // 7. Gerar 12 pagamentos mensais
        await pagamentoService.generatePaymentsForContract(
            novoContrato.id!,
            data.criancaId,
            data.responsavelId,
            dataInicio,
            data.valorAnual,
            data.adminId
        );

        return novoContrato;
    }

    /**
     * Renovar contrato vencido
     */
    async renewContract(data: {
        contratoVencidoId: number;
        dataInicio?: string | Date;
        percentualReajuste?: number;
        observacoes?: string;
    }): Promise<ContratoDTO> {
        // 1. Buscar contrato vencido
        const contratoVencido = await repository.findById(data.contratoVencidoId);

        if (!contratoVencido) {
            throw new Error('Contrato não encontrado');
        }

        if (contratoVencido.status !== 'VENCIDO') {
            throw new Error('Apenas contratos vencidos podem ser renovados');
        }

        // 2. Calcular novo valor (com reajuste se fornecido)
        const percentual = data.percentualReajuste || 0;
        const novoValorAnual = contratoVencido.valorAnual * (1 + percentual / 100);

        // 3. Definir data de início (padrão: dia seguinte ao fim do contrato anterior)
        let dataInicio: Date;
        if (data.dataInicio) {
            dataInicio = new Date(data.dataInicio);
        } else {
            dataInicio = new Date(contratoVencido.dataFim);
            dataInicio.setDate(dataInicio.getDate() + 1);
        }

        // 4. Calcular data fim
        const dataFim = new Date(dataInicio);
        dataFim.setFullYear(dataFim.getFullYear() + 1);
        dataFim.setDate(dataFim.getDate() - 1);

        // 5. Criar novo contrato
        const novoContrato = await repository.create({
            criancaId: contratoVencido.criancaId,
            responsavelId: contratoVencido.responsavelId,
            adminId: contratoVencido.adminId,
            dataInicio: dataInicio,
            dataFim: dataFim,
            valorAnual: novoValorAnual,
            valorMensal: novoValorAnual / 12,
            status: 'ATIVO',
            contratoAnteriorId: contratoVencido.id,
            observacoes: data.observacoes || `Renovação com reajuste de ${percentual}%`
        });

        // 6. Arquivar contrato anterior
        await repository.updateStatus(contratoVencido.id!, 'ARQUIVADO');

        // 7. Gerar novos pagamentos
        await pagamentoService.generatePaymentsForContract(
            novoContrato.id!,
            contratoVencido.criancaId,
            contratoVencido.responsavelId,
            dataInicio,
            novoValorAnual,
            contratoVencido.adminId
        );

        return novoContrato;
    }

    /**
     * Buscar contrato ativo de uma criança
     */
    async getActiveContract(criancaId: number): Promise<ContratoDTO | null> {
        return repository.findActiveByCriancaId(criancaId);
    }

    /**
     * Buscar histórico de contratos de uma criança
     */
    async getContractHistory(criancaId: number): Promise<ContratoDTO[]> {
        return repository.findByCriancaId(criancaId);
    }

    /**
     * Arquivar contratos vencidos automaticamente
     */
    async archiveExpiredContracts(adminId: number): Promise<number> {
        const contratosVencidos = await repository.findExpiredContracts(adminId);

        let arquivados = 0;
        for (const contrato of contratosVencidos) {
            await repository.updateStatus(contrato.id!, 'VENCIDO');
            arquivados++;
        }

        return arquivados;
    }

    /**
     * Cancelar contrato manualmente
     */
    async cancelContract(contratoId: number, motivo: string): Promise<boolean> {
        const contrato = await repository.findById(contratoId);

        if (!contrato) {
            throw new Error('Contrato não encontrado');
        }

        if (contrato.status !== 'ATIVO') {
            throw new Error('Apenas contratos ativos podem ser cancelados');
        }

        // Cancelar contrato
        await repository.updateStatus(contratoId, 'CANCELADO', motivo);

        // Deletar pagamentos pendentes
        await pagamentoService.deletePaymentsByContractId(contratoId);

        return true;
    }

    /**
     * Listar contratos arquivados
     */
    async getArchivedContracts(adminId: number): Promise<ContratoDTO[]> {
        return repository.findArchivedContracts(adminId);
    }
}
