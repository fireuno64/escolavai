import { EscolaRepository } from '../repositories/EscolaRepository.js';
export class EscolaService {
    escolaRepository;
    constructor() {
        this.escolaRepository = new EscolaRepository();
    }
    async createEscola(data) {
        if (!data.nome) {
            throw new Error('Nome da escola é obrigatório.');
        }
        return this.escolaRepository.create(data);
    }
    async getEscolas(adminId) {
        return this.escolaRepository.findAll(adminId);
    }
    async getEscolaById(id, adminId) {
        return this.escolaRepository.findById(id, adminId);
    }
    async updateEscola(id, data, adminId) {
        return this.escolaRepository.update(id, data, adminId);
    }
    async deleteEscola(id, adminId) {
        return this.escolaRepository.delete(id, adminId);
    }
}
