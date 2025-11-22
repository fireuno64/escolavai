import connection from './db.js';

async function setup() {
    try {
        console.log('Iniciando setup do banco de dados...');

        // Tabela Responsavel
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS responsavel (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                cpf VARCHAR(14) NOT NULL UNIQUE,
                telefone VARCHAR(20),
                email VARCHAR(255),
                endereco VARCHAR(255),
                senha VARCHAR(255) NOT NULL,
                valor_contrato DECIMAL(10, 2) DEFAULT 0.00,
                data_inicio_contrato DATE NULL,
                rg VARCHAR(20) NULL
            )
        `);
        console.log('Tabela "responsavel" verificada/criada.');

        // Tabela Crianca
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS crianca (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                escola VARCHAR(255),
                horario_entrada TIME,
                horario_saida TIME,
                responsavelId INT NOT NULL,
                FOREIGN KEY (responsavelId) REFERENCES responsavel(id) ON DELETE CASCADE
            )
        `);
        console.log('Tabela "crianca" verificada/criada.');

        // Tabela Pagamento
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS pagamento (
                id INT AUTO_INCREMENT PRIMARY KEY,
                responsavelId INT NOT NULL,
                valor DECIMAL(10, 2) NOT NULL,
                dataPagamento DATETIME DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'Pendente',
                FOREIGN KEY (responsavelId) REFERENCES responsavel(id) ON DELETE CASCADE
            )
        `);
        console.log('Tabela "pagamento" verificada/criada.');

        // Add columns if they don't exist (for migrations)
        const alterCommands = [
            { query: `ALTER TABLE responsavel ADD COLUMN endereco VARCHAR(255) AFTER email`, msg: 'endereco' },
            { query: `ALTER TABLE responsavel ADD COLUMN valor_contrato DECIMAL(10, 2) DEFAULT 0.00`, msg: 'valor_contrato' },
            { query: `ALTER TABLE responsavel ADD COLUMN data_inicio_contrato DATE NULL`, msg: 'data_inicio_contrato' },
            { query: `ALTER TABLE responsavel ADD COLUMN rg VARCHAR(20) NULL`, msg: 'rg' },
            { query: `ALTER TABLE responsavel ADD COLUMN admin_id INT NULL`, msg: 'admin_id' },
            { query: `ALTER TABLE crianca ADD COLUMN data_inicio_contrato DATE NULL`, msg: 'crianca.data_inicio_contrato' },
            { query: `ALTER TABLE crianca ADD COLUMN valor_contrato_anual DECIMAL(10, 2) DEFAULT 0.00`, msg: 'crianca.valor_contrato_anual' },
            { query: `ALTER TABLE crianca ADD COLUMN valor_contrato_anual DECIMAL(10, 2) DEFAULT 0.00`, msg: 'crianca.valor_contrato_anual' },
            { query: `ALTER TABLE admin ADD COLUMN active BOOLEAN DEFAULT TRUE`, msg: 'admin.active' },
            { query: `ALTER TABLE responsavel ADD COLUMN active BOOLEAN DEFAULT TRUE`, msg: 'responsavel.active' }
        ];

        for (const cmd of alterCommands) {
            try {
                await connection.execute(cmd.query);
                console.log(`Coluna "${cmd.msg}" adicionada.`);
            } catch (err: any) {
                if (err.code !== 'ER_DUP_FIELDNAME') {
                    console.log(`Nota: Coluna "${cmd.msg}" já existe ou erro:`, err.message);
                }
            }
        }

        console.log('Setup concluído!');
        process.exit(0);
    } catch (error) {
        console.error('Erro no setup:', error);
        process.exit(1);
    }
}

setup();
