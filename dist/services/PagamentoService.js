// src/services/PagamentoService.ts
import { PagamentoRepository } from '../repositories/PagamentoRepository.js';
import connection from '../db.js';
const repository = new PagamentoRepository();
export class PagamentoService {
    async createPagamento(data, adminId) {
        if (!data.responsavelId) {
            throw new Error("ID do responsável é obrigatório.");
        }
        if (data.valor <= 0) {
            throw new Error("O valor deve ser maior que zero.");
        }
        return repository.create(data, adminId);
    }
    async getPagamentos(adminId) {
        return repository.findAll(adminId);
    }
    async getPagamentoById(id, adminId) {
        const pagamento = await repository.findById(id, adminId);
        if (!pagamento) {
            throw new Error("Pagamento não encontrado.");
        }
        return pagamento;
    }
    async getPagamentosByResponsavel(responsavelId) {
        return repository.findByResponsavel(responsavelId);
    }
    async updatePagamento(id, data, adminId) {
        return repository.update(id, data, adminId);
    }
    async deletePagamento(id, adminId) {
        return repository.delete(id, adminId);
    }
    /**
     * Generates 12 monthly payments for a child based on contract start date
     * @param criancaId - ID of the child
     * @param responsavelId - ID of the responsavel (parent)
     * @param dataInicio - Contract start date
     * @param valorAnual - Annual contract value
     * @param adminId - ID of the admin
     */
    async generatePaymentsForChild(criancaId, responsavelId, dataInicio, valorAnual, adminId) {
        const startDate = new Date(dataInicio);
        const valorMensal = valorAnual / 12;
        // Start from next month
        const firstPaymentDate = new Date(startDate);
        firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
        firstPaymentDate.setDate(5); // Due on 5th of each month
        const payments = [];
        for (let i = 0; i < 12; i++) {
            const dueDate = new Date(firstPaymentDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            payments.push({
                responsavelId,
                criancaId,
                valor: valorMensal,
                dataPagamento: dueDate.toISOString().split('T')[0],
                status: 'Pendente',
                adminId
            });
        }
        // Insert all payments - using camelCase column names to match database schema
        const query = `
            INSERT INTO pagamento (responsavelId, criancaId, valor, dataPagamento, status, admin_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        for (const payment of payments) {
            await connection.query(query, [
                payment.responsavelId,
                payment.criancaId,
                payment.valor,
                payment.dataPagamento,
                payment.status,
                payment.adminId
            ]);
        }
        console.log(`✅ Generated ${payments.length} payments for crianca ${criancaId}`);
    }
    /**
     * Delete all payments for a specific child
     * @param criancaId - ID of the child
     */
    async deletePaymentsForChild(criancaId) {
        const query = 'DELETE FROM pagamento WHERE criancaId = ?';
        await connection.query(query, [criancaId]);
        console.log(`🗑️ Deleted all payments for crianca ${criancaId}`);
    }
    /**
     * Regenerate payments for a child (delete old ones and create new ones)
     */
    async regeneratePaymentsForChild(criancaId, responsavelId, dataInicio, valorAnual, adminId) {
        // Delete existing payments
        await this.deletePaymentsForChild(criancaId);
        // Generate new payments
        await this.generatePaymentsForChild(criancaId, responsavelId, dataInicio, valorAnual, adminId);
    }
    /**
     * Generate payments for a specific contract
     */
    async generatePaymentsForContract(contratoId, criancaId, responsavelId, dataInicio, valorAnual, adminId) {
        const startDate = new Date(dataInicio);
        const valorMensal = valorAnual / 12;
        // Start from next month
        const firstPaymentDate = new Date(startDate);
        firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
        firstPaymentDate.setDate(5); // Due on 5th of each month
        const payments = [];
        for (let i = 0; i < 12; i++) {
            const dueDate = new Date(firstPaymentDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            payments.push({
                responsavelId,
                criancaId,
                contratoId,
                valor: valorMensal,
                dataPagamento: dueDate.toISOString().split('T')[0],
                status: 'Pendente',
                adminId
            });
        }
        // Insert all payments with contract_id
        const query = `
            INSERT INTO pagamento (responsavelId, criancaId, contrato_id, valor, dataPagamento, status, admin_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        for (const payment of payments) {
            await connection.query(query, [
                payment.responsavelId,
                payment.criancaId,
                payment.contratoId,
                payment.valor,
                payment.dataPagamento,
                payment.status,
                payment.adminId
            ]);
        }
        console.log(`✅ Generated ${payments.length} payments for contract ${contratoId}`);
    }
    /**
     * Delete all pending payments for a specific contract
     */
    async deletePaymentsByContractId(contratoId) {
        const query = 'DELETE FROM pagamento WHERE contrato_id = ? AND status = ?';
        await connection.query(query, [contratoId, 'Pendente']);
        console.log(`🗑️ Deleted pending payments for contract ${contratoId}`);
    }
}
