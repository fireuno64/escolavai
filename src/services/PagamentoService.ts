// src/services/PagamentoService.ts

import { PagamentoRepository, PagamentoDTO } from '../repositories/PagamentoRepository.js';

const repository = new PagamentoRepository();

export class PagamentoService {

    async createPagamento(data: PagamentoDTO) {
        if (!data.responsavelId) {
            throw new Error("ID do responsável é obrigatório.");
        }
        if (data.valor <= 0) {
            throw new Error("O valor deve ser maior que zero.");
        }
        return repository.create(data);
    }

    async getPagamentos() {
        return repository.findAll();
    }

    async getPagamentoById(id: number) {
        const pagamento = await repository.findById(id);
        if (!pagamento) {
            throw new Error("Pagamento não encontrado.");
        }
        return pagamento;
    }

    async updatePagamento(id: number, data: Partial<PagamentoDTO>) {
        return repository.update(id, data);
    }

    async deletePagamento(id: number) {
        return repository.delete(id);
    }
}
