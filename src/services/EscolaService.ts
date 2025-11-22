import { EscolaRepository, EscolaDTO } from '../repositories/EscolaRepository.js';

export class EscolaService {
    private escolaRepository: EscolaRepository;

    constructor() {
        this.escolaRepository = new EscolaRepository();
    }

    async createEscola(data: EscolaDTO) {
        if (!data.nome) {
            throw new Error('Nome da escola é obrigatório.');
        }
        return this.escolaRepository.create(data);
    }

    async getEscolas(adminId: number) {
        return this.escolaRepository.findAll(adminId);
    }

    async getEscolaById(id: number, adminId: number) {
        return this.escolaRepository.findById(id, adminId);
    }

    async updateEscola(id: number, data: Partial<EscolaDTO>, adminId: number) {
        return this.escolaRepository.update(id, data, adminId);
    }

    async deleteEscola(id: number, adminId: number) {
        return this.escolaRepository.delete(id, adminId);
    }
}
