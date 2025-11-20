import 'dotenv/config';
import mysql from 'mysql2/promise';

async function setup() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: process.env.MYSQL_PASSWORD,
        database: 'escolavai_db'
    });

    try {
        console.log('Atualizando tabelas...');

        // 1. Tabela Responsável (Adicionar senha se não existir)
        // Nota: Em produção, usaríamos migrations. Aqui, vamos verificar se a coluna existe.
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS responsavel (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                cpf VARCHAR(14) NOT NULL,
                telefone VARCHAR(20),
                email VARCHAR(255),
                enderecoId INT,
                senha VARCHAR(255) DEFAULT '123456' 
            )
        `);

        // Tenta adicionar a coluna senha caso a tabela já exista sem ela
        try {
            await connection.execute(`ALTER TABLE responsavel ADD COLUMN senha VARCHAR(255) DEFAULT '123456'`);
            console.log('Coluna "senha" adicionada à tabela responsavel.');
        } catch (err) {
            if (err.code !== 'ER_DUP_FIELDNAME') {
                console.log('Nota: Coluna "senha" já existe ou erro ao adicionar:', err.message);
            }
        }

        // 2. Tabela Admin
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admin (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL
            )
        `);
        console.log('Tabela "admin" criada ou verificada.');

        // 3. Criar Admin Padrão (se não existir)
        const [admins] = await connection.execute('SELECT * FROM admin WHERE email = ?', ['admin@escolavai.com']);
        if (admins.length === 0) {
            await connection.execute('INSERT INTO admin (nome, email, senha) VALUES (?, ?, ?)', ['Administrador', 'admin@escolavai.com', 'admin123']);
            console.log('Admin padrão criado: admin@escolavai.com / admin123');
        }

        // 4. Tabela Pagamento (Manter como está)
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

        console.log('Setup concluído!');
        process.exit(0);
    } catch (error) {
        console.error('Erro no setup:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

setup();
